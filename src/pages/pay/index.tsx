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
import { Status } from "../../components/status";
import { UserTypeUser } from "../../@types/user";
import { getCurrentTimestamp } from "../../utils/date";

interface PayProps {
    selectedLanguage: string;
    isTg: boolean;
    user: UserTypeUser | null 
}

export const Pay: FC<PayProps> = ({
    selectedLanguage,
    isTg,
    user
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

    const [isPaidStatus, setIsPaidStatus] = useState<boolean | undefined>(undefined);

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
                // setRatesLoading(false);
            }
        };

        fetchRates();
    }, []);

    useEffect(() => {
        if (ratesData.length > 0) {
            setRatesLoading(false);
        }
    }, [ratesData])

    const handleCreateInvoice = async (subId: string | number) => {
        try {
            // константа на бесплатную подписку
            if (!user || (user.free === true && Number(subId) === 6)) {
                console.error('Dont pay')
            }
            TgObj.CloudStorage.getItem("key-api", async (error, jwtKey) => {
                let newJwtKey = jwtKey;
                if (newJwtKey) {
                    const res = await vpn.createInvoiceTelegram(
                        subId + "",
                        newJwtKey
                    );
                    TgObj.openInvoice(res, async (status) => {
                        if (status === "paid") {
                            console.log("paid")
                            setIsPaidStatus(true)
                            
                        } else {
                            console.log("other paid", status)

                            setIsPaidStatus(false)
                        }
                    });
                }
            });
        } catch (error) {}
    };

    const dateSubscribe = user && user.time_subscribe > getCurrentTimestamp() ? new Date(user.time_subscribe * 1000).toLocaleDateString('ru-RU') : ''
    

    return (
        <div>
            {isCopiedAddress && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedAddress(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: "#dab200" }}
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
                    tgStyles={{ background: "#dab200" }}
                    className={s.alert}
                >
                    <span className={s.alertText}>
                        {t("common.username-copied")}
                    </span>
                </Alert>
            )}
            {isPaidStatus === undefined ?
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
                        {user && dateSubscribe !== '' ? <Div tgStyles={{ color: "var(--tg-theme-text-color)" }}>У вас оплачена подписка до {dateSubscribe}</Div> : null }
                </div>
            </div> : null }

{isPaidStatus === undefined ?
            <PromotionPay
                isTg={isTg}
                ratesLoading={ratesLoading}
                activeRate={activeRate}
                setActiveRate={setActiveRate}
                data={sortedDataByPrice}
                showTitle={false}
                loadingRate={loadingRate}
                user={user}
                handleCreateInvoice={handleCreateInvoice}
            />
            : 
            <Status isSuccess={isPaidStatus}/>}
        </div>
    );
};
