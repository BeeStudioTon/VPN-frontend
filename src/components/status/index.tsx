/* eslint-disable import/no-extraneous-dependencies */
import { FC } from 'react'
import Lottie, { Options } from 'react-lottie'
import { useTranslation } from 'react-i18next'

import { Text, Title } from '@delab-team/de-ui'

import * as Oops from '../../assets/stickers/oops.json'
import * as Success from '../../assets/stickers/success.json'

import s from './status.module.scss'

interface StatusProps {
    isSuccess: boolean
}

export const Status: FC<StatusProps> = ({ isSuccess }) => {
    const approveOptions1: Options = {
        loop: true,
        autoplay: true,
        animationData: Oops,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }
    const approveOptions2: Options = {
        loop: true,
        autoplay: true,
        animationData: Success,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const { t } = useTranslation()

    return (
        <div className={s.inner}>
            {isSuccess ? (
                <>
                    <Lottie
                        options={approveOptions2}
                        height={140}
                        isClickToPauseDisabled={true}
                        width={140}
                    />

                    <Title variant="h3" className={s.ready}>
                        {t('status.succ-title')}
                    </Title>

                    <Text className={s.text}>
                        {t('status.succ-description')}
                    </Text>
                </>
            ) : (
                <>
                    <Lottie
                        options={approveOptions1}
                        height={140}
                        isClickToPauseDisabled={true}
                        width={140}
                    />

                    <Title variant="h3" className={s.error}>
                        {t('status.error-title')}
                    </Title>

                    <Text className={s.text}>
                        {t('status.error-description')}
                    </Text>
                </>
            )}
        </div>
    )
}
