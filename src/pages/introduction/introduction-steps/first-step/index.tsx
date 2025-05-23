/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable consistent-return */
import { FC, useEffect } from 'react'
import { Text, Title } from '@delab-team/de-ui'
import Lottie, { Options } from 'react-lottie'
import { useTranslation } from 'react-i18next'
import WebAppSDK from '@twa-dev/sdk'

import { Button } from '../../../../components/ui/button'

import { UserType } from '../../../../@types/user'



import * as helloSticker from '../../../../assets/stickers/find.json'

import s from './first-step.module.scss'

interface FirstStepProps {
    handleNextStep: () => void;
    handleIntroductionClose: () => void;
    currentStep: number;
    user: UserType | null;
}

export const FirstStep: FC<FirstStepProps> = ({
    handleNextStep,
    currentStep,
    handleIntroductionClose,
    user
}) => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: helloSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const TgObj = WebAppSDK
    const { t } = useTranslation()

    const auth = !!localStorage.getItem('ton-connect-ui_wallet-info')

    const isPaidUser = () => {
        const activeTariff = false

        // if (activeTariff === null || activeTariff?.id === null) {
        //     return false
        // }

        // if (calculateDaysFromTimestamp(Date.parse(user?.user?.activeTo ?? '0') / 1000) >= 1) {
        //     return true
        // }

        return false
    }

    const isPaid = isPaidUser()

    useEffect(() => {
        if (currentStep !== 1 || !auth) return

        if (isPaid) {
            handleIntroductionClose()
        } else {
            handleNextStep()
        }
    }, [ ])

    return (
        <div className={s.firstStep}>
            <div className={s.content}>
                <Lottie
                    options={approveOptions}
                    height={140}
                    isClickToPauseDisabled={true}
                    width={140}
                />

                <Title variant="h1" className={s.firstTitle}>
                    {t('introduction.welcome-title')} <span>BeeVPN</span>
                </Title>

                <Text className={s.firstText}>{t('introduction.welcome-description1')}</Text>
                <Text className={s.firstText}>{t('introduction.welcome-description2')}</Text>

                <Button className={s.firstButton} onClick={() => {
                    handleIntroductionClose()
                }}>
                    {t('common.skip')}
                </Button>
            </div>
        </div>
    )
}
