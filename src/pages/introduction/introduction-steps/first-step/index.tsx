/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable consistent-return */
import { FC, useEffect } from 'react'
import { Text, Title } from '@delab-team/de-ui'
import Lottie, { Options } from 'react-lottie'
import { useTranslation } from 'react-i18next'
import WebAppSDK from '@twa-dev/sdk'
// import { useTonConnectUI } from '@tonconnect/ui-react'
import { TonConnectUI } from '@tonconnect/ui'

import { Button } from '../../../../components/ui/button'

import * as helloSticker from '../../../../assets/stickers/hello.json'

import s from './first-step.module.scss'

interface FirstStepProps {
    handleNextStep: () => void;
    handleIntroductionClose: () => void;
    currentStep: number;
    rawAddress: string | undefined;
    tonConnectUI: TonConnectUI
}

export const FirstStep: FC<FirstStepProps> = ({ handleNextStep, currentStep, rawAddress, handleIntroductionClose, tonConnectUI }) => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: helloSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const TgObj = WebAppSDK
    const { t } = useTranslation()

    const auth = !!localStorage.getItem('ton-connect-ui_wallet-info')

    // const [ tonConnectUI, setOptions ] = useTonConnectUI()

    useEffect(() => {
        if (currentStep !== 1 || !auth) return

        handleNextStep()
    }, [ rawAddress ])

    return (
        <div className={s.firstStep}>
            <div className={s.content}>
                <Lottie
                    options={approveOptions}
                    height={140}
                    isClickToPauseDisabled={true}
                    width={140}
                />

                <Title variant="h1" className={s.firstTitle}>{t('introduction.welcome-title')} <span>DeVPN</span></Title>

                <Text className={s.firstText}>{t('introduction.welcome-description1')}</Text>
                <Text className={s.firstText}>{t('introduction.welcome-description2')}</Text>

                <Button className={s.firstButton} onClick={() => tonConnectUI.connectWallet()}>{t('common.connect-btn')}</Button>

                <Button className={s.skipButton} onClick={() => handleIntroductionClose()}>{t('common.skip')}</Button>
            </div>
        </div>
    )
}
