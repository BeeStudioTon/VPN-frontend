/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebAppSDK from "@twa-dev/sdk";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";

import { Alert, Div, IconImg } from "@delab-team/de-ui";

import { smlAddr } from "../../../utils/smlAddr";
import { ROUTES } from "../../../utils/router";
import star from "../../../assets/icons/categories/star.png";

import { SvgSelector } from "../../../assets/svg-selector";

import { useHapticFeedback } from "../../../hooks/useHapticFeedback";

import s from "./info.module.scss";

interface InfoProps {
    rawAddress: string;
}

export const Info: FC<InfoProps> = ({ rawAddress }) => {
    const [isCopiedAddress, setIsCopiedAddress] = useState<boolean>(false);

    const navigate = useNavigate();

    const TgObj = WebAppSDK;

    const { t } = useTranslation();

    return (
        <div className={s.inner}>
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
            <div className={s.user}>
                <div className={s.userInner}>
                    <div
                        className={s.userAvatar}
                        onClick={() => {
                            navigate(ROUTES.PROFILE);
                            useHapticFeedback();
                        }}
                    >
                        <img
                            src={`https://t.me/i/userpic/320/${TgObj?.initDataUnsafe?.user?.username}.jpg`}
                            onLoad={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                            ) => {
                                const target = e.currentTarget;
                                if (
                                    target.naturalWidth === 1 ||
                                    target.naturalHeight === 1
                                ) {
                                    target.style.display = "none";
                                }
                            }}
                            alt=""
                        />
                        {
                            <div className={s.userAvatarCustom}>
                                {TgObj?.initDataUnsafe?.user?.username?.slice(
                                    0,
                                    2
                                )}
                            </div>
                        }
                    </div>
                    <div className={s.userNameApp}>
                        Bee<span>VPN</span>
                    </div>
                    <div
                        className={s.userStar}
                        onClick={() => {
                            navigate(ROUTES.PROMOTIONS);
                            useHapticFeedback();
                        }}
                    >
                        <IconImg src={star} />
                    </div>
                </div>
                {/* <SvgSelector id="chevron-right" /> */}
            </div>
        </div>
    );
};
