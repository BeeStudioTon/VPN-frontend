/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect } from 'react'
import Lottie, { Options } from 'react-lottie'
import { useTranslation } from 'react-i18next'
import WebAppSDK from '@twa-dev/sdk'

import { Title } from '@delab-team/de-ui'

import * as oopsSticker from '../../assets/stickers/oops.json'

import { useHapticFeedback } from '../../hooks/useHapticFeedback'

import s from './styles.module.scss'

interface SomethingWentWrongProps {}

export const SomethingWentWrong: FC<SomethingWentWrongProps> = () => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: oopsSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const { t } = useTranslation()

    const TgObj = WebAppSDK

    const handleButton = () => {
        TgObj.openTelegramLink("https://t.me/beevpnfree_bot")
        useHapticFeedback()
    }

    useEffect(() => {
        TgObj.MainButton.show()
        TgObj.MainButton.text = t('common.to-app')
        TgObj.MainButton.onClick(handleButton)

        // return () => TgObj.MainButton.offClick(handleButton)
    }, [])

    const isTgCheck = window.Telegram.WebApp.initData !== ''

    return (
        <div className={s.inner}>
            <div className={s.innerImg}>
                <Lottie options={approveOptions}
                    height={140}
                    isClickToPauseDisabled={true}
                    width={140}
                />
            </div>
            <Title variant="h2" className={`${s.innerTitle} ${s.innerTitleRed}`}>{t('common.oops')}</Title>
            <Title variant="h2" className={s.innerText}>{!isTgCheck ? t('common.error-tg') : t('common.something-went-wrong')}</Title>
        </div>
    )
}
