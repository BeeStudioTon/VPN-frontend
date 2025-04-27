/* eslint-disable max-len */
import React, { FC, useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { Button, IconImg, Text } from "@delab-team/de-ui";
import { motion, AnimatePresence } from "framer-motion";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import Cell from "../../assets/icons/categories/cell.png";

import { ServerData } from "../../@types/servers";

import { SvgSelector } from "../../assets/svg-selector";

import { SkeletonInfo } from "../skeleton-info";

import s from "./server-selected.module.scss";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/router";

interface ServerSelectedProps {
    serversData: ServerData[];
    selectedServer: ServerData | null;
    isLoading: boolean;
    isTg: boolean;
    userLoading: boolean;
    isPaid: boolean;
    setSelectedServer: React.Dispatch<React.SetStateAction<ServerData | undefined>>
}

countries.registerLocale(enLocale);

const getCountryName = (code: string) => {
    return countries.getName(code.toUpperCase(), "en") || "Unknown";
};

export const ServerSelected: FC<ServerSelectedProps> = ({
    serversData,
    selectedServer,
    setSelectedServer,
    isLoading,
    isTg,
    userLoading,
    isPaid
}) => {
    if (!selectedServer) return <></>;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleServerSelection = (server: ServerData) => {
        setSelectedServer(server);
        setIsDropdownOpen(false);
        useHapticFeedback();
    };

    const navigate = useNavigate();

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setIsDropdownOpen(false);
            useHapticFeedback();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredServersData = serversData.filter(
        (el) => el.ipServer !== selectedServer.ipServer
    );

    return (
        <div className={s.serversSelector}>
            <div
                className={`${s.selectedServer} ${s.serverItem}`}
                onClick={() =>
                    !userLoading && setIsDropdownOpen(!isDropdownOpen)
                }
                ref={buttonRef}
            >
                <>
                    <div className={s.serverItemLeft}>
                        <ReactCountryFlag
                            countryCode={selectedServer?.geo}
                            svg
                            style={{
                                width: "3em",
                                height: "3em",
                            }}
                            title="US"
                        />
                        <div className={s.serverItemTextBlock}>
                            <Text className={s.serverItemServer}>
                                {getCountryName(selectedServer.geo)}
                            </Text>
                            <Text className={s.serverItemIp}>
                                {selectedServer?.nameServer} -{" "}
                                {selectedServer.ipServer}
                            </Text>
                        </div>
                    </div>
                    <div className={s.serverItemRight}>
                        <div className={s.serverItemPing}>
                            <IconImg src={Cell} />
                        </div>

                        <Button
                            size="small"
                            className={s.serverItemButtonChange}
                            onClick={() => {
                                navigate(ROUTES.CHANGE);
                                useHapticFeedback();
                            }}
                        >
                            Change
                        </Button>
                    </div>
                </>
                {/* <>
                    <div className={s.serverItemBottom}></div>
                </> */}
            </div>
        </div>
    );
};
