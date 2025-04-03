/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect, useState } from "react";
import { Alert, Div, Text, Title } from "@delab-team/de-ui";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { motion } from "framer-motion";

import { SvgSelector } from "../../assets/svg-selector";

import s from "./pay.module.scss";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";
import { PromotionPay } from "../../components/promotion-pay";
import { RatesType } from "../../@types/rates";
import { VPN } from "../../logic/vpn";

interface PayProps {
    rawAddress: string;
    selectedLanguage: string;
    isTg: boolean;
    setSelectedLanguage: (el: string) => void;
}

export const Pay: FC<PayProps> = ({
    rawAddress,
    selectedLanguage,
    isTg,
    setSelectedLanguage,
}) => {
    const { t } = useTranslation();

    const TgObj = WebApp;

    const navigate = useNavigate();

    const [isCopiedAddress, setIsCopiedAddress] = useState<boolean>(false);
    const [isCopiedUsername, setIsCopiedUsername] = useState<boolean>(false);

    // Rates Data
    const [ratesData, setRatesData] = useState<RatesType[]>([]);
    // Loading Rates Data
    const [ratesLoading, setRatesLoading] = useState<boolean>(false);

    const [loadingRate, setLoadingRate] = useState<boolean>(false);

    const [activeRate, setActiveRate] = useState<RatesType | undefined>(
        undefined
    );

    const isPaymentPage = localStorage.getItem("toPaymentPage") === "true";

    const sortedDataByPrice = ratesData
        ?.slice()
        ?.sort((a, b) => Number(a?.priceDollar) - Number(b?.priceDollar));

    const handlePrev = () => {
        TgObj.BackButton.hide();
        navigate("/");
        useHapticFeedback();
    };

    useEffect(() => {
        TgObj.BackButton.show();
        TgObj.BackButton.onClick(handlePrev);
        return () => {
            TgObj.BackButton.offClick(handlePrev);
        };
    }, []);

    const handleNavigate = () => {
        window.localStorage.clear();
        window.location.pathname = "/";
        useHapticFeedback();
    };

    const handleExit = () => {
        TgObj.showConfirm(t("common.you-sure"), (isConfirmed) => {
            if (isConfirmed) {
                handleNavigate();
            }
        });
    };

    const vpn = new VPN();

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setRatesLoading(true);
                const key = TgObj.CloudStorage.getItem(
                    "key-api",
                    async (error, data) => {
                        if (data) {
                            const res = await vpn.getRates(data);
                            setRatesData(res);
                        }
                    }
                );
            } finally {
                setRatesLoading(false);
            }
        };

        fetchRates();
    }, []);

    const handleCreateInvoice = async (subId: string | number) => {
        try {
            TgObj.CloudStorage.getItem("key-api", async (error, jwtKey) => {
                let newJwtKey = jwtKey;
                if (newJwtKey) {
                    const res = await vpn.createInvoiceTelegram(
                        subId + "",
                        newJwtKey
                    );
                    TgObj.openInvoice(res, async (status) => {
                        if (status === "paid") {
                            handleNavigate();
                        } else {
                        }
                    });
                }
            });
        } catch (error) {}
    };

    return (
        <div>
            {isCopiedAddress && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedAddress(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: "var(--tg-theme-button-color)" }}
                    className={s.alert}
                >
                    <span className={s.alertText}>
                        {t("common.address-copied")}
                    </span>
                </Alert>
            )}
            {isCopiedUsername && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedUsername(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: "var(--tg-theme-button-color)" }}
                    className={s.alert}
                >
                    <span className={s.alertText}>
                        {t("common.username-copied")}
                    </span>
                </Alert>
            )}
            <div className={s.userTg}>
                <div className={s.userTgInner}>
                    <img
                        src={`https://t.me/i/userpic/320/${TgObj?.initDataUnsafe?.user?.username}.jpg`}
                        onLoad={(
                            e: React.SyntheticEvent<HTMLImageElement, Event>
                        ) => {
                            const target = e.currentTarget;
                            if (
                                target.naturalWidth === 0 ||
                                target.naturalHeight === 0
                            ) {
                                target.style.display = "none";
                            }
                        }}
                        alt=""
                    />
                    {
                        <div className={s.avatar}>
                            {TgObj?.initDataUnsafe?.user?.username?.slice(0, 2)}
                        </div>
                    }
                </div>
                <div>
                    <div className={s.name}>
                        <Div tgStyles={{ color: "var(--tg-theme-text-color)" }}>
                            {TgObj?.initDataUnsafe?.user?.first_name}
                        </Div>
                        <Div tgStyles={{ color: "var(--tg-theme-text-color)" }}>
                            {TgObj?.initDataUnsafe?.user?.last_name}
                        </Div>
                    </div>
                    {TgObj?.initDataUnsafe?.user?.username &&
                        TgObj?.initDataUnsafe?.user?.username?.length >= 1 && (
                            <div
                                className={s.username}
                                onClick={() => {
                                    setIsCopiedUsername(true);
                                    useHapticFeedback();
                                }}
                            >
                                @{TgObj?.initDataUnsafe?.user?.username}
                            </div>
                        )}
                </div>
            </div>

            <PromotionPay
                isTg={isTg}
                ratesLoading={ratesLoading}
                activeRate={activeRate}
                setActiveRate={setActiveRate}
                data={sortedDataByPrice}
                showTitle={false}
                loadingRate={loadingRate}
                handleCreateInvoice={handleCreateInvoice}
            />
        </div>
    );
};
