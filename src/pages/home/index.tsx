/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Lottie, { Options } from "react-lottie";

import { Text, Title } from "@delab-team/de-ui";
import WebAppSDK from "@twa-dev/sdk";

import { Info } from "./info";
import { Button } from "../../components/ui/button";
import { DownloadModal } from "../../components/download-modal";
import { Traffic } from "../../components/traffic";
import { ServersSelector } from "../../components/servers-selector";
import { ServerSelected } from "../../components/server-selected";

import { VPN } from "../../logic/vpn";

import { UserType, UserTypeUser } from "../../@types/user";
import { ServerData } from "../../@types/servers";
import { KeyType } from "../../@types/get-keys";

import { calculateDaysFromTimestamp } from "../../utils/formatDateFromTimestamp";
import { openTelegramLink } from "../../utils/open-telegram-link";

import { SvgSelector } from "../../assets/svg-selector";

import * as speedSticker from "../../assets/stickers/speed.json";
import * as sleepSticker from "../../assets/stickers/sleep.json";
import * as loadingSticker from "../../assets/stickers/loading.json";

import s from "./home.module.scss";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";
import ReactCountryFlag from "react-country-flag";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/router";
import { getCurrentTimestamp } from "../../utils/date";

interface HomeProps {
    user: UserTypeUser | null;
    userLoading: boolean;
    keysData: KeyType[] | undefined;
    isTg: boolean;
    isSkippedIntroduction: boolean;
    TgObj: typeof WebAppSDK;
    serverData: ServerData[];
    selectedServer: ServerData | undefined;
    setSelectedServer: React.Dispatch<
        React.SetStateAction<ServerData | undefined>
    >;
}

export const Home: FC<HomeProps> = ({
    user,
    keysData,
    userLoading,
    isTg,
    serverData,
    selectedServer,
    setSelectedServer,
    TgObj,
}) => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: speedSticker,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    const approveOptions2: Options = {
        loop: true,
        autoplay: true,
        animationData: sleepSticker,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    const approveOptions3: Options = {
        loop: true,
        autoplay: true,
        animationData: loadingSticker,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    };

    const { t } = useTranslation();
    const vpn = new VPN();
    const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
    const [serverDataLoading, setServerDataLoading] = useState<boolean>(false);
    const [connectServerData, setConnectServerData] = useState<KeyType | null>(
        null
    );

    const navigate = useNavigate();

    const [ipUser, setIpUser] = useState<string | null>(null);

    const [isConnect, setIsConnect] = useState<boolean>(false);

    useEffect(() => {
        const connectServer = keysData?.find(
            (el) => el.id === selectedServer?.id
        );

        if (!connectServer) {
            createKey();
        } else {
            setConnectServerData(connectServer);
        }
    }, [selectedServer, keysData]);

    const checkPaidUser = (userTime: number): boolean => {
        console.log("userTime", userTime);
        console.log("getCurrentTimestamp", getCurrentTimestamp());
        return userTime > getCurrentTimestamp();
    };

    const isPaid = checkPaidUser(user?.time_subscribe ?? 0);

    async function getIpUser() {
        const ip = await vpn.getIp();

        if (ip) {
            console.log("ipUser", ip);
            setIpUser(ip);
        }
    }

    useEffect(() => {
        if (selectedServer) {
            if (selectedServer.ipServer === ipUser) {
                setIsConnect(true);
            } else {
                setIsConnect(false);
            }
        }
    }, [ipUser, selectedServer]);

    useEffect(() => {
        if (selectedServer) {
            getIpUser(); // Вызываем сразу при монтировании

            const interval = setInterval(getIpUser, 5000); // Запускаем интервал на 5 секунд

            return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
        }
    }, [selectedServer]);

    async function createKey() {
        console.log("init create key");
        if (!selectedServer) {
            console.log("server not select");
            return;
        }

        if (!isPaid) {
            console.log("not user pay");
            return;
        }

        try {
            TgObj.CloudStorage.getItem("key-api", async (error, data) => {
                if (data) {
                    const keyData = await vpn.getOrCreateKey(
                        selectedServer?.id,
                        data
                    );

                    if (keyData.outlineId) {
                        setConnectServerData(keyData);
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching key:", error);
        }
    }

    const handleConnect = (key: string) => {
        const isWindows = navigator.platform.toUpperCase().includes("WIN");

        if (isWindows) {
            const encodedUrl = encodeURIComponent(key);
            const queryString = new URLSearchParams({
                key: encodedUrl,
            }).toString();
            window.open(`/redirect?${queryString}`, "_blank");
            openTelegramLink(key);
            TgObj.openLink(`/redirect?${queryString}`)
        } else {
            openTelegramLink(key);
        }
    };

    const handlePay = () => {
        navigate(ROUTES.PROMOTIONS);
    };

    const handleConnectServer = async () => {
        if (!connectServerData) {
            console.error("connectServerData undefined");
            return;
        }

        // @ts-ignore
        handleConnect(
            connectServerData.keyData +
                "#BeeVPN " +
                connectServerData.nameServer
        );
    };

    const handleButton = () => {
        useHapticFeedback();
        // if (isPaid) {
        handleConnectServer();
        // } else {
        //     localStorage.removeItem("hasPassedIntroduction");
        //     localStorage.setItem("toPaymentPage", "true");
        //     localStorage.setItem("currentIntroductionStep", "2");
        //     window.location.href = "/introduction";
        // }
    };

    // const limit = isPaid ? user?.infoUser?.limit : 0;
    // const used = isPaid ? user?.infoUser?.used : 0;
    return (
        <>
            {showDownloadModal && (
                <DownloadModal
                    showDownloadModal={showDownloadModal}
                    setShowDownloadModal={setShowDownloadModal}
                />
            )}

            <Info />
            <div className={s.status}>
                {userLoading ? (
                    <>
                        <Lottie
                            options={approveOptions3}
                            height={140}
                            isClickToPauseDisabled={true}
                            width={140}
                        />
                        <Text className={s.loading}>{t("common.loading")}</Text>
                    </>
                ) : (
                    <>
                        {isPaid ? (
                            <>
                                {isConnect ? (
                                    <Lottie
                                        options={approveOptions}
                                        height={140}
                                        isClickToPauseDisabled={true}
                                        width={140}
                                    />
                                ) : (
                                    <Lottie
                                        options={approveOptions3}
                                        height={140}
                                        isClickToPauseDisabled={true}
                                        width={140}
                                    />
                                )}
                                <Title
                                    variant="h2"
                                    className={s.statusTitle}
                                    tgStyles={{
                                        color: "#dab200",
                                    }}
                                >
                                    {isConnect
                                        ? t("home.connected")
                                        : t("home.ready-to-connect")}
                                </Title>
                            </>
                        ) : (
                            <>
                                <Lottie
                                    options={approveOptions2}
                                    height={140}
                                    isClickToPauseDisabled={true}
                                    width={140}
                                />

                                <Title variant="h2" className={s.statusTitle}>
                                    {t("common.not-active-plan")}
                                </Title>
                                <Text className={s.statusText}>
                                    {t("common.choose-plan")}
                                </Text>
                            </>
                        )}

                        {/* <Title
                            variant="h2"
                            className={s.statusTitle}
                            tgStyles={{ color: "var(--tg-theme-button-color)" }}
                        >
                            {isConnect
                                ? t("home.connected")
                                : t("home.ready-to-connect")}
                        </Title> */}
                        {/* {!isConnect ? (
                            <Text className={s.statusText}>
                                {t("common.download-text")}
                            </Text>
                        ) : undefined} */}
                    </>
                )}
            </div>
            {selectedServer ? (
                <ServerSelected
                    serversData={serverData}
                    selectedServer={selectedServer}
                    setSelectedServer={setSelectedServer}
                    isTg={isTg}
                    userLoading={userLoading}
                    isLoading={serverDataLoading}
                    isPaid={isPaid}
                />
            ) : null}

            {/* {isPaid ? ( */}
                <div className={s.connectInner}>
                    <Button
                        className={s.connectButton}
                        onClick={() => {
                            isPaid ? handleButton() : handlePay()
                        }}
                        disabled={userLoading}
                    >
                        {userLoading
                            ? t("common.loading")
                            : t("common.connect")}
                    </Button>
                    <Button
                        className={s.downloadButton}
                        onClick={() => {
                            setShowDownloadModal(true);
                            useHapticFeedback();
                        }}
                    >
                        <SvgSelector id="download" />
                        {t("common.download-app")}
                    </Button>
                </div>
            
            {/* //     <div className={s.connectInner}>
            //         <Button
            //             className={s.connectButton}
            //             onClick={handlePay}
            //             disabled={userLoading}
            //         >
            //             {t("common.select-plan-btn")}
            //         </Button>
            //     </div>
            // )} */}

            {/* <div className={s.traffic}>
                <div className={s.trafficTop}>
                    <Title variant="h3" className={s.trafficTitle}>
                        {t("home.traffic-title")}
                    </Title>
                    {isPaid ? (
                        <Title variant="h3" className={s.trafficTitle}>
                            {t("home.traffic-update-in")}{" "}
                            {calculateDaysFromTimestamp(
                                Date.parse(user?.user?.activeTo ?? "0") / 1000
                            )}{" "}
                            {calculateDaysFromTimestamp(
                                Date.parse(user?.user?.activeTo ?? "0") / 1000
                            ) > 1
                                ? t("home.days")
                                : t("home.day")}
                        </Title>
                    ) : (
                        <></>
                    )}
                </div>

                <Traffic
                    limit={limit}
                    used={used}
                    isTg={isTg}
                    userLoading={userLoading}
                />
            </div> */}
        </>
    );
};
