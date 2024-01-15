import { FC, useEffect, useState } from 'react'
import { Title } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'

import { useTranslation } from 'react-i18next'

import { RatesType } from '../../../../../@types/rates'

import { VPN } from '../../../../../logic/vpn'

import s from './plan.module.scss'
import { PromotionPay } from '../../../../../components/promotion-pay'

interface PlanProps {
    activeRate: RatesType | undefined
    setActiveRate: React.Dispatch<React.SetStateAction<RatesType | undefined>>
    isTg: boolean
}

export const Plan: FC<PlanProps> = ({
    activeRate,
    setActiveRate,
    isTg
}) => {
    // Rates Data
    const [ ratesData, setRatesData ] = useState<RatesType[]>([])
    console.log('🚀 ~ ratesData:', ratesData)
    // Loading Rates Data
    const [ ratesLoading, setRatesLoading ] = useState<boolean>(false)

    const [ loadingRate, setLoadingRate ] = useState<boolean>(false)

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
            </div>
        </div>
    )
}
