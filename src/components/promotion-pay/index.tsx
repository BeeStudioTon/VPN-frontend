import { FC, useState } from 'react'
import { Button, Div, Li, Title, Text } from '@delab-team/de-ui'
import { v1 } from 'uuid'
import { useTranslation } from 'react-i18next'

import { SkeletonInfo } from '../skeleton-info'

import { RatesType } from '../../@types/rates'

import { SvgSelector } from '../../assets/svg-selector'

import s from './promotion-pay.module.scss'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface PromotionPayProps {
    isTg: boolean;
    data: RatesType[];
    activeRate: RatesType | undefined;
    setActiveRate: React.Dispatch<React.SetStateAction<RatesType | undefined>>;
    ratesLoading: boolean;
    setShow?: React.Dispatch<React.SetStateAction<boolean>>;
    showPayModal?: boolean;
    showTitle?: boolean;
    loadingRate: boolean;
    handleCreateInvoice: Function
}

const textTgStyles = { color: 'var(--tg-theme-text-color)' }

const buttonTgStyles = {
    background: 'var(--tg-theme-button-color)',
    color: 'var(--tg-theme-button-text-color)'
}

export const PromotionPay: FC<PromotionPayProps> = ({
    isTg,
    data,
    activeRate,
    setActiveRate,
    ratesLoading,
    setShow,
    showPayModal = false,
    showTitle = true,
    loadingRate,
    handleCreateInvoice
}) => {
    const { t } = useTranslation()

    const [ isSelected, setIsSelected ] = useState<boolean>(false)

    return (
        <div className={s.promotion}>
            {showTitle && (
                <Title variant="h3" className={s.promotionTitle} tgStyles={textTgStyles}>
                    {t('promotions-page.promotion-pay.title')}
                </Title>
            )}

            <ul className={s.promotionList}>
                {ratesLoading
                    ? new Array(5).fill(null).map(_ => (
                        <Div
                            key={v1()}
                            className={`${s.promotionLi}`}
                            tgStyles={{
                                border: '1px solid var(--tg-theme-bg-color)',
                                background: 'transparent'
                            }}
                        >
                            <div className={s.promotionLiAction}>
                                <Div
                                    className={`${s.promotionLiButton}`}
                                    tgStyles={{ border: '1px solid var(--tg-theme-button-color)' }}
                                ></Div>
                                <div className={s.promotionLiBody}>
                                    <div className={s.promotionLiLeft}>
                                        <div className={s.promotionLiInfo}>
                                            <Text
                                                className={s.promotionLiTitle}
                                                tgStyles={textTgStyles}
                                            >
                                                <SkeletonInfo widthFull isTg={isTg} />
                                            </Text>
                                        </div>
                                        <Text
                                            className={s.promotionLiDescription}
                                            tgStyles={textTgStyles}
                                        >
                                            <SkeletonInfo isTg={isTg} />{' '}
                                            <SkeletonInfo isTg={isTg} />
                                        </Text>
                                    </div>
                                    <div className={s.promotionLiRight}>
                                        <Text
                                            className={s.promotionLiTitle}
                                            tgStyles={textTgStyles}
                                        >
                                            <SkeletonInfo widthHalf isTg={isTg} />
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Div>
                    ))
                    : data.map(el => (
                        <Li
                            key={v1()}
                            className={`${s.promotionLi} ${
                                activeRate?.id === el?.id ? s.promotionLiActive : ''
                            }`}
                            onClick={() => {
                                setActiveRate(el)
                                localStorage.setItem('activeRate', JSON.stringify(el))
                                setIsSelected(!isSelected)
                                useHapticFeedback()
                            }}
                        >
                            <div className={s.promotionLiAction}>
                                <Div
                                    className={`${s.promotionLiButton} ${
                                        activeRate?.id === el?.id ? s.promotionLiButtonActive : ''
                                    }`}
                                    onClick={() => {
                                        setActiveRate(el)
                                        localStorage.setItem('activeRate', JSON.stringify(el))
                                        setIsSelected(!isSelected)
                                        useHapticFeedback()
                                    }}
                                >
                                    {activeRate?.id === el?.id ? (
                                        <SvgSelector id="checked" />
                                    ) : null}
                                </Div>
                                <div className={s.promotionLiBody}>
                                    <div className={s.promotionLiLeft}>
                                        <div className={s.promotionLiInfo}>
                                            <Text className={s.promotionLiTitle}>
                                                {el?.nameSubscribe}
                                            </Text>
                                            {el.oldPriceDollar !== 0 && el.priceDollar !== 0 && (
                                                <div className={s.promotionLiBadge}>
                                                      -
                                                    {Math.round(
                                                        ((el.oldPriceDollar - el.priceDollar)
                                                              / el.oldPriceDollar)
                                                              * 100
                                                    )}
                                                      %
                                                </div>
                                            )}
                                        </div>
                                        <Text
                                            className={s.promotionLiDescription}
                                            tgStyles={textTgStyles}
                                        >
                                            {el?.oldPriceDollar !== 0 && (
                                                <span className={s.promotionLiOldPrice}>
                                                      ${el?.oldPriceDollar}
                                                </span>
                                            )}{' '}
                                              ${el?.priceDollar} / {el?.nameSubscribe}
                                        </Text>
                                    </div>
                                    <div className={s.promotionLiRight}>
                                        <Text className={s.promotionLiPrice}>
                                            {el.timeSubscribe === 7 ? (
                                                'Free / 7 days'
                                            ) : (
                                                <>${el?.priceStar.toFixed(2)} Star</>
                                            )}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Li>
                    ))}
            </ul>

           
                <Button
                    className={s.promotionActionPay}
                    onClick={() => {
                        handleCreateInvoice(activeRate?.id)
                        // localStorage.removeItem('hasPassedIntroduction')
                        // localStorage.setItem('toPaymentPage', 'true')
                        // localStorage.setItem('currentIntroductionStep', '3')
                        // window.location.href = '/introduction'
                    }}
                    tgStyles={buttonTgStyles}
                    disabled={!activeRate || loadingRate}
                >
                    {t('common.pay-btn')}
                </Button>
            
        </div>
    )
}
