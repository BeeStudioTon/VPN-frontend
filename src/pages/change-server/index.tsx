/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect, useRef, useState } from "react";
import { Alert, Button, Div, IconImg, Text, Title } from "@delab-team/de-ui";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { motion } from "framer-motion";
import Cell from "../../assets/icons/categories/cell.png";
import { KeyType } from "../../@types/get-keys";

import { SvgSelector } from "../../assets/svg-selector";

import { VPN } from "../../logic/vpn";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import s from "./change.module.scss";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";
import { ServerData } from "../../@types/servers";
import { ROUTES } from "../../utils/router";

interface ChangeServerProps {
    selectedLanguage: string;
    keysData: KeyType[] | undefined;
    serverData: ServerData[];
    selectedServer: ServerData | undefined
    setSelectedServer: React.Dispatch<React.SetStateAction<ServerData | undefined>>
}

countries.registerLocale(enLocale);

const getCountryName = (code: string) => {
    return countries.getName(code.toUpperCase(), "en") || "Unknown";
};

export const ChangeServer: FC<ChangeServerProps> = ({
    selectedLanguage,
    serverData,
    selectedServer,
    setSelectedServer,
    keysData,
}) => {
    const { t } = useTranslation();
    const vpn = new VPN();

    const TgObj = WebApp;

    const navigate = useNavigate();

    const handleServerSelection = (server: ServerData) => {
        setSelectedServer(server);

        try {
            TgObj.CloudStorage.setItem('select-server', server.id + '')
        } catch (error) {
            console.error(error)
        }

        navigate(ROUTES.HOME);
        useHapticFeedback();
    };

    const handlePrev = () => {
        TgObj.BackButton.hide();
        navigate("/");
        useHapticFeedback();
    };

    useEffect(() => {
        const connectServer = keysData?.find(
            (el) => el.id === selectedServer?.id
        );

        if (!connectServer) {
            createKey();
        }
    }, [selectedServer, keysData]);

    async function createKey() {
        console.log("init create key");
        if (!selectedServer) {
            console.log("server not select");
            return;
        }

        try {
            TgObj.CloudStorage.getItem("key-api", async (error, data) => {
                if (data) {
                    const keyData = await vpn.getOrCreateKey(
                        selectedServer?.id,
                        data
                    );
                }
            });
        } catch (error) {
            console.error("Error fetching key:", error);
        }
    }

    useEffect(() => {
        TgObj.BackButton.show();
        TgObj.BackButton.onClick(handlePrev);
        return () => {
            TgObj.BackButton.offClick(handlePrev);
        };
    }, [])

    return (
        <div>

            {serverData.map((server) => (
                <div
                    key={server.id}
                    className={s.serverItem}
                    onClick={() => server.active ? handleServerSelection(server) : null}
                    style={server.active ? {} : {opacity: '0.6', cursor: 'not-allowed'}}
                >
                    <>
                        <div className={s.serverItemLeft}>
                            <ReactCountryFlag
                                countryCode={server.geo}
                                svg
                                style={{
                                    width: "3em",
                                    height: "3em",
                                }}
                                title="US"
                            />
                            <div className={s.serverItemTextBlock}>
                                <Text className={s.serverItemServer}>
                                    {getCountryName(server.geo)}
                                </Text>
                                <Text className={s.serverItemIp}>
                                    {server.nameServer} - {server.ipServer}
                                </Text>
                            </div>
                        </div>
                        <div className={s.serverItemRight}>
                            <div className={s.serverItemPing}>
                                {server.active ? <IconImg src={Cell} /> : '⛔️' }
                            </div>
                            <Button
                                size="small"
                                className={s.serverItemButtonChange}
                                disabled={!server.active}
                            >
                                Select
                            </Button>
                        </div>
                    </>
                </div>
            ))}
        </div>
    );
};
