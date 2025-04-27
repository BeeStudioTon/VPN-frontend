/* eslint-disable import/namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import { FC, useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AppInner } from "@delab-team/de-ui";
import WebAppSDK from "@twa-dev/sdk";

import { Home } from "./pages/home";
import { Introduction } from "./pages/introduction";
import { Profile } from "./pages/profile";
import { SomethingWentWrong } from "./pages/something-went-wrong";
import { Redirect } from "./pages/redirect";

import { ROUTES } from "./utils/router";
import "./utils/i18n";

import { VPN } from "./logic/vpn";

import { UserType, UserTypeUser } from "./@types/user";
import { KeyType } from "./@types/get-keys";

import "./index.scss";
import { Pay } from "./pages/pay";
import { ChangeServer } from "./pages/change-server";
import { ServerData } from "./@types/servers";
import { getCurrentTimestamp } from "./utils/date";

declare global {
    interface Window {
        Telegram?: any;
    }
}

WebAppSDK.ready();

export const App: FC = () => {
    const [firstRender, setFirstRender] = useState<boolean>(false);
    const [isTg, setIsTg] = useState<boolean>(false);
    const TgObj = WebAppSDK;

    // user
    const [user, setUser] = useState<UserTypeUser | null>(null);
    const [userLoading, setUserLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    // user end

    const [keysData, setKeysData] = useState<KeyType[]>([]);
    const [serverData, setServerData] = useState<ServerData[]>([]);
    const [selectedServer, setSelectedServer] = useState<
        ServerData | undefined
    >(undefined);

    // Introduction
    const [showIntroduction, setShowIntroduction] = useState<boolean>(true);

    // Skipped introduction
    const [isSkippedIntroduction, setIsSkippedIntroduction] =
        useState<boolean>(false);

    const [jwtKeys, setJwtKeys] = useState<
        { accessToken: string; refreshToken: string } | undefined
    >(undefined);

    const navigate = useNavigate();

    const vpn = new VPN();

    const checkPaidUser = (userTime: number): boolean => {
            return userTime > getCurrentTimestamp();
        };
    
        const isPaid = checkPaidUser(user?.time_subscribe ?? 0);

    const loadJwtKeys = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            TgObj.CloudStorage.getItems(
                ["refresh-api", "key-api"],
                (error, keys) => {
                    if (error) {
                        reject(new Error("Ошибка при загрузке ключей JWT"));
                        return;
                    }

                    if (
                        keys &&
                        keys["refresh-api"] &&
                        keys["key-api"] &&
                        keys["refresh-api"] !== "" &&
                        keys["key-api"] !== ""
                    ) {
                        setJwtKeys({
                            accessToken: keys["key-api"],
                            refreshToken: keys["refresh-api"],
                        });
                        resolve(); // Успешное завершение
                    } else {
                        reject(new Error("Ключи JWT не найдены или пусты"));
                    }
                }
            );
        });
    };

    const logOutUser = async (error: string) => {
        TgObj.CloudStorage.removeItems([
            "key-api",
            "refresh-api",
            "select-server",
        ]);
        console.error("Error refreshJWT:", error);
        setIsError(true);
        navigate(ROUTES.SOMETHING_WENT_WRONG);
    }

    const refreshToken = async (): Promise<void | Error> => {
        try {
            TgObj.CloudStorage.getItems(
                ["refresh-api", "key-api"],
                async (error, keys) => {
                    if (error) {
                        console.error("Error Tg:", error);
                        setIsError(true);
                        navigate(ROUTES.SOMETHING_WENT_WRONG);
                    }
                    let newJwtKeys;

                    if (
                        keys &&
                        keys["refresh-api"] &&
                        keys["key-api"] &&
                        keys["refresh-api"] !== "" &&
                        keys["key-api"] !== ""
                    ) {
                        try {
                            newJwtKeys = await vpn.refreshJWT(
                                keys["key-api"],
                                keys["refresh-api"]
                            );

                            if (newJwtKeys instanceof Error) {
                                logOutUser(newJwtKeys.message)
                                return
                            }
                        } catch (error: any) {
                            logOutUser(error)
                            return
                        }
                    } else {
                        try {
                            newJwtKeys = await vpn.telegramLogin(
                                TgObj.initData
                            );

                            if (newJwtKeys instanceof Error) {
                                logOutUser(newJwtKeys.message)
                                return
                            }
                        } catch (error: any) {
                            logOutUser(error)
                            return
                        }
                    }

                    if (newJwtKeys instanceof Error || !newJwtKeys) {
                        throw new Error(
                            newJwtKeys?.message ?? "Error newJwtKeys"
                        );
                    }

                    TgObj.CloudStorage.setItem(
                        "key-api",
                        newJwtKeys.accessToken
                    );
                    TgObj.CloudStorage.setItem(
                        "refresh-api",
                        newJwtKeys.refreshToken
                    );

                    setJwtKeys({
                        accessToken: newJwtKeys.accessToken,
                        refreshToken: newJwtKeys.refreshToken,
                    });
                }
            );
        } catch (error) {
            console.error("Error Tg:", error);
            setIsError(true);
            navigate(ROUTES.SOMETHING_WENT_WRONG);
        }
    };

    const getUserKeysAndUserInfo = async (): Promise<boolean> => {
        if (!jwtKeys) {
            return false;
        }
        try {
            let keysData: KeyType[] = []
            if (isPaid) {
                keysData = await vpn.getKeys(jwtKeys.accessToken);
            }

            const userInfo = await vpn.getUser(jwtKeys.accessToken);
            if (userInfo instanceof Error) {
                throw new Error("User not found");
            }

            setUser(userInfo);
            setIsError(false);
            setKeysData(keysData);
            return true;
        } catch (error) {
            console.error(`getUserKeysAndUserInfo: ${error}`);
            return false;
        }
    };

    const getServers = async (): Promise<boolean> => {
        if (!jwtKeys) {
            return false;
        }
        try {
            const res = await vpn.getServers(jwtKeys.accessToken);
            setServerData(res);
            setUserLoading(false)
            return true;
        } catch (error) {
            console.error(`getUserKeysAndUserInfo: ${error}`);
            return false;
        }
    };

    const getAndSetActiveServer = async (): Promise<boolean> => {
        if (!serverData) {
            return false;
        }
        return new Promise((resolve, reject) => {
            TgObj.CloudStorage.getItem("select-server", async (error, data) => {
                if (error) {
                    if (serverData) setSelectedServer(serverData[0]);
                }
                if (data && serverData) {
                    const findServer = serverData.find(
                        (server) => Number(server.id) === Number(data)
                    );
                    if (findServer) {
                        setSelectedServer(findServer);
                    } else {
                        if (serverData) setSelectedServer(serverData[0]);
                    }

                    resolve(true); // Успешное завершение
                } else {
                    if (serverData) setSelectedServer(serverData[0]);
                    reject(new Error("Ключи JWT не найдены или пусты"));
                }
            });
        });
    };

    // init twa
    useEffect(() => {
        if (!firstRender && TgObj) {
            setFirstRender(true);

            setUserLoading(true)

            loadJwtKeys();

            const isTgCheck = window.Telegram?.WebApp.initData !== "";
            const bodyStyle = document.body.style;

            if (
                window.location.pathname === ROUTES.SOMETHING_WENT_WRONG &&
                !isError
            ) {
                TgObj.MainButton.hide();
                navigate("/");
            }

            if (!isTgCheck && window.location.pathname === "/redirect") {
                return;
            }

            if (isTgCheck) {
                TgObj.ready();
                TgObj.enableClosingConfirmation();
                TgObj.expand();
                TgObj.requestFullscreen()
                TgObj.lockOrientation()
                setIsTg(true);

                // bodyStyle.backgroundColor =
                //     "var(--tg-theme-secondary-bg-color)";
                // bodyStyle.setProperty(
                //     "background-color",
                //     "var(--tg-theme-secondary-bg-color)",
                //     "important"
                // );
            } else {
                navigate(ROUTES.SOMETHING_WENT_WRONG);
            }

            if (window.location.pathname !== ROUTES.INTRODUCTION) {
                if (!isTg) {
                    return;
                }
                TgObj.requestWriteAccess();
            }
        }
    }, [firstRender, isError, navigate, TgObj]);

    // когда получены ключи
    useEffect(() => {
        if (isTg) {
            if (jwtKeys) {
                getUserKeysAndUserInfo();
                getServers();
            } else {
                refreshToken();
            }
        }
    }, [jwtKeys, isTg, navigate]);

    // установка сервера пользователя
    useEffect(() => {
        if (serverData) {
            getAndSetActiveServer()
        }
    }, [serverData])
    // introduction check
    useEffect(() => {
        const isTgCheck = window.Telegram?.WebApp.initData !== "";
        const hasPassedIntroduction = localStorage.getItem(
            "hasPassedIntroduction"
        );

        if (window.location.pathname === ROUTES.REDIRECT) {
            return;
        }

        if (!isTgCheck) {
            navigate(ROUTES.SOMETHING_WENT_WRONG);
            return;
        }

        if (hasPassedIntroduction) {
            setShowIntroduction(false);
        } else {
            navigate(ROUTES.INTRODUCTION);
        }
    }, [navigate]);

    // introduction skip check
    useEffect(() => {
        const hasSkippedIntroduction = localStorage.getItem(
            "skippedIntroduction"
        );

        if (hasSkippedIntroduction) {
            setIsSkippedIntroduction(true);
        }
    }, []);

    useEffect(() => {
        if (window.location.pathname === ROUTES.HOME) {
            TgObj.BackButton.hide();
        }
    }, [window.location.pathname, TgObj]);

    // ===================================================
    const savedLanguage = localStorage.getItem("i18nextLng");
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        savedLanguage || "en"
    );

    const { i18n } = useTranslation();

    useEffect(() => {
        const initializeLanguage = async () => {
            const TgLanguage = TgObj?.initDataUnsafe?.user?.language_code;
            let language;

            const userDefinedLanguage = localStorage.getItem("i18nextLngOwn");

            if (userDefinedLanguage) {
                language = userDefinedLanguage;
            } else if (TgLanguage) {
                const lowerCaseTgLanguage = TgLanguage.toLowerCase();

                if (["ru", "en"].includes(lowerCaseTgLanguage)) {
                    language = lowerCaseTgLanguage;
                } else {
                    language = "en";
                }
            } else {
                language = "en";
            }

            setSelectedLanguage(language);
        };

        if (isTg && !savedLanguage) {
            initializeLanguage();
        }
    }, [isTg, savedLanguage, TgObj]);

    useEffect(() => {
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem("i18nextLng", selectedLanguage);
    }, [selectedLanguage, i18n]);

    //= =======================================================

    return (
        <AppInner isTg={isTg}>
            <div className="wrapper">
                {!showIntroduction ? (
                    <Routes>
                        <Route
                            path={ROUTES.HOME}
                            element={
                                <Home
                                    isSkippedIntroduction={
                                        isSkippedIntroduction
                                    }
                                    isTg={isTg}
                                    keysData={keysData}
                                    serverData={serverData}
                                    selectedServer={selectedServer}
                                    setSelectedServer={setSelectedServer}
                                    user={user}
                                    userLoading={userLoading}
                                    TgObj={TgObj}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.INTRODUCTION}
                            element={
                                <Introduction
                                    user={user}
                                    keysData={keysData}
                                    isTg={isTg}
                                    setShowIntroduction={setShowIntroduction}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.PROFILE}
                            element={
                                <Profile
                                    selectedLanguage={selectedLanguage}
                                    setSelectedLanguage={setSelectedLanguage}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.SOMETHING_WENT_WRONG}
                            element={<SomethingWentWrong />}
                        />
                        <Route path={ROUTES.REDIRECT} element={<Redirect />} />
                        <Route
                            path={ROUTES.PROMOTIONS}
                            element={
                                <Pay
                                    isTg={isTg}
                                    user={user}
                                    selectedLanguage={selectedLanguage}
                                />
                            }
                        />

                        <Route
                            path={ROUTES.CHANGE}
                            element={
                                <ChangeServer
                                    selectedLanguage={selectedLanguage}
                                    keysData={keysData}
                                    serverData={serverData}
                                    selectedServer={selectedServer}
                                    setSelectedServer={setSelectedServer}
                                />
                            }
                        />
                        <Route
                            path="*"
                            element={<Navigate to={ROUTES.HOME} replace />}
                        />
                    </Routes>
                ) : (
                    <Routes>
                        <Route
                            path={ROUTES.INTRODUCTION}
                            element={
                                <Introduction
                                    user={user}
                                    keysData={keysData}
                                    isTg={isTg}
                                    setShowIntroduction={setShowIntroduction}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.SOMETHING_WENT_WRONG}
                            element={<SomethingWentWrong />}
                        />
                        <Route path={ROUTES.REDIRECT} element={<Redirect />} />
                        <Route
                            path="*"
                            element={<Navigate to={ROUTES.HOME} replace />}
                        />
                    </Routes>
                )}
            </div>
        </AppInner>
    );
};
