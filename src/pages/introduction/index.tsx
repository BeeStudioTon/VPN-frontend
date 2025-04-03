/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-globals */
import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WebAppSDK from "@twa-dev/sdk";

import { RatesType } from "../../@types/rates";
import { UserType, UserTypeUser } from "../../@types/user";
import { KeyType } from "../../@types/get-keys";

import { FirstStep } from "./introduction-steps/first-step";

import s from "./introduction.module.scss";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";

interface IntroductionProps {
    setShowIntroduction: React.Dispatch<React.SetStateAction<boolean>>;
    isTg: boolean;
    user: UserTypeUser | null;
    keysData: KeyType[] | undefined;
}

export const Introduction: FC<IntroductionProps> = ({
    setShowIntroduction,
    isTg,
    user,
}) => {
    const TgObj = WebAppSDK;

    const [currentStep, setCurrentStep] = useState<number>(0);

    // Active Rate
    const [activeRate, setActiveRate] = useState<RatesType | undefined>(
        undefined
    );

    const location = useLocation();

    useEffect(() => {
        const storedActiveRate = localStorage.getItem("activeRate");
        if (storedActiveRate) {
            setActiveRate(JSON.parse(storedActiveRate));
        }
    }, []);

    // Introduction step
    useEffect(() => {
        const urlSearchParams = new URLSearchParams(location.search);
        const stepParam = urlSearchParams.get("step");
        const step = stepParam
            ? parseInt(stepParam, 10)
            : parseInt(
                  localStorage.getItem("currentIntroductionStep") || "1",
                  10
              );

        if (!isNaN(step) && step >= 1 && step <= 6) {
            setCurrentStep(step);
            setShowIntroduction(true);
        }
    }, [location.search, setShowIntroduction]);

    useEffect(() => {
        localStorage.setItem("currentIntroductionStep", currentStep.toString());
    }, [currentStep]);

    // active rate
    useEffect(() => {
        if (activeRate) {
            localStorage.setItem("activeRate", JSON.stringify(activeRate));
        }
    }, [activeRate]);

    const handleIntroductionClose = () => {
        localStorage.setItem("hasPassedIntroduction", "true");
        localStorage.removeItem("currentIntroductionStep");
        localStorage.removeItem("activeRate");
        localStorage.removeItem("skippedIntroduction");
        setShowIntroduction(false);
        setCurrentStep(1);
        TgObj.MainButton.hide();
        window.location.pathname = "/";
        useHapticFeedback();
    };

    const handleNextStep = () => {
        setCurrentStep(currentStep + 1);
        useHapticFeedback();
    };

    const handlePrevStep = () => {
        const isPaymentPage = localStorage.getItem("toPaymentPage") === "true";
        useHapticFeedback();
        if (isPaymentPage && currentStep <= 2) {
            localStorage.setItem("hasPassedIntroduction", "true");
            TgObj.BackButton.hide();
            window.location.pathname = "/";
            return;
        }
        setCurrentStep(currentStep - 1);
    };

    useEffect(() => {
        const isPaymentPage = localStorage.getItem("toPaymentPage") === "true";
        if (isPaymentPage && currentStep <= 2) {
            TgObj.BackButton.show();
            TgObj.BackButton.onClick(handlePrevStep);
        } else if (currentStep >= 3 && currentStep <= 5) {
            TgObj.BackButton.show();
            TgObj.BackButton.onClick(handlePrevStep);
        } else {
            TgObj.BackButton.hide();
        }

        return () => {
            TgObj.BackButton.offClick(handlePrevStep);
        };
    }, [currentStep]);
    return (
        <div className={s.wrapper}>
            <FirstStep
                user={user}
                currentStep={currentStep}
                handleNextStep={handleNextStep}
                handleIntroductionClose={handleIntroductionClose}
            />
        </div>
    );
};
