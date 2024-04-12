import { FC, useEffect, useState } from 'react'
import { Title } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'

import { useTranslation } from 'react-i18next'

import { PromotionPay } from '../../../../../components/promotion-pay'
import { Button } from '../../../../../components/ui/button'

import { RatesType } from '../../../../../@types/rates'

import { VPN } from '../../../../../logic/vpn'

import s from './plan.module.scss'

interface PlanProps {
    activeRate: RatesType | undefined
    setActiveRate: React.Dispatch<React.SetStateAction<RatesType | undefined>>
    isTg: boolean
    handleIntroductionClose: () => void
}

export const Plan: FC<PlanProps> = ({
    activeRate,
    setActiveRate,
    isTg,
    handleIntroductionClose
}) => {
    // Rates Data
    const [ ratesData, setRatesData ] = useState<RatesType[]>([])
    // Loading Rates Data
    const [ ratesLoading, setRatesLoading ] = useState<boolean>(false)

    const [ loadingRate, setLoadingRate ] = useState<boolean>(false)

    const isPaymentPage = localStorage.getItem('toPaymentPage') === 'true'

    const { t } = useTranslation()

    const vpn = new VPN()

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setRatesLoading(true)
                const res = await vpn.getRates()
                setRatesData(res)
            } finally {
                setRatesLoading(false)
            }
        }

        fetchRates()
    }, [])

    const sortedDataByPrice = ratesData?.slice()?.sort((a, b) => Number(a?.price) - Number(b?.price))

    return (
        <div className={s.plan}>
            <Title className={s.planTitle} variant="h2">
                {t('subscribe.actions')}
            </Title>

            <div className={s.planActions}>
                <PromotionPay
                    isTg={isTg}
                    ratesLoading={ratesLoading}
                    activeRate={activeRate}
                    setActiveRate={setActiveRate}
                    data={sortedDataByPrice}
                    showTitle={false}
                    loadingRate={loadingRate}
                />
                {!isPaymentPage && (
                    <Button className={s.skipButton} onClick={() => {
                        WebAppSDK.MainButton.hide()
                        handleIntroductionClose()
                    }}>{t('common.skip-plan')}</Button>
                )}
            </div>

        </div>
    )
}
