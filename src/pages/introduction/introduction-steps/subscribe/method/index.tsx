/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useEffect, useState } from 'react'
import { v1 } from 'uuid'
import { useTranslation } from 'react-i18next'
import { TonApi } from '@delab-team/ton-api-sdk'
import { fromNano } from '@ton/core'
import { Input, Text, Title } from '@delab-team/de-ui'
import Lottie, { Options } from 'react-lottie'

import { UserType } from '../../../../../@types/user'
import { AssetType } from '../../../../../@types/asset-type'

import { tokensData } from '../../../../../mocks/tokens'

import { SvgSelector } from '../../../../../assets/svg-selector'

import { formatNumber } from '../../../../../utils/formatNumber'

import * as FindStickers from '../../../../../assets/stickers/find.json'

import s from './method.module.scss'
import { MethodSkeleton } from './method-skeleton'

interface MethodProps {
    amount: number | undefined;
    activePayToken: AssetType | undefined;
    setActivePayToken: (el: AssetType | undefined) => void;
    currentStep: number
    rawAddress: string
    user: UserType | null
    isPaymentLoading: boolean
    isTg: boolean
    assetsData: AssetType[] | undefined
    setAssetsData: React.Dispatch<React.SetStateAction<AssetType[] | undefined>>
}

export const Method: FC<MethodProps> = ({
    rawAddress, activePayToken, setActivePayToken, amount, assetsData,
    setAssetsData, isPaymentLoading, isTg
}) => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: FindStickers,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const { t } = useTranslation()

    const [ isPaymentPage, setIsPaymentPage ] = useState<boolean>(false)

    const [ jettonsLoading, setJettonsLoading ] = useState<boolean>(false)

    const api = new TonApi('AFJOFCU7XVPBKMIAAAAM6H4MQHHW57TAGBG2EY3C3A6USOZUSGXEI6MRDW32YKVQDZBCGUQ', 'mainnet')

    const [ searchValue, setSearchValue ] = useState<string>('')

    async function getJettons (address: string) {
        try {
            setJettonsLoading(true)
            const res = await api.Accounts.getAllJettonsBalances(address as any, 'usd')

            const tokenAddressesArr = tokensData?.map(item => item?.tokenAddress[0])
            const tonInfo = await api.Accounts.getHumanFriendlyInfo(address as any)

            const jettonAddresses = res?.balances?.map(el => el?.jetton?.address)

            jettonAddresses?.push('TON' as any)

            const priceRes = await api?.Rates.getTokenPrice(jettonAddresses as any, 'usd')

            // @ts-ignore
            const tonPrice = priceRes?.rates.TON?.prices?.USD

            const updatedTokens = tokensData?.map((el) => {
                if (el.token === 'TON') {
                    return {
                        ...el,
                        amount: fromNano(tonInfo!.balance),
                        tokenPriceUSD: formatNumber(tonPrice),
                        amountUSD: (tonPrice * Number(fromNano(tonInfo!.balance))).toString()
                    }
                }

                const matchingAddresses = tokenAddressesArr?.filter(
                    el3 => priceRes?.rates?.hasOwnProperty(el3)
                )

                for (const matchingAddress of matchingAddresses ?? '') {
                    if (el.tokenAddress[0] === matchingAddress) {
                        // @ts-ignore
                        const matchingBalance = priceRes?.rates[matchingAddress]?.prices?.USD
                        const tokenPrice = res?.balances.find(
                            el4 => el4?.jetton?.address === matchingAddress as any
                        )

                        return {
                            ...el,
                            amount: fromNano(tokenPrice!.balance),
                            tokenPriceUSD: String(matchingBalance),
                            amountUSD: (
                                parseFloat(fromNano(tokenPrice!.balance).toString())
                                * parseFloat(matchingBalance as string)
                            ).toFixed(2)
                        }
                    }
                }

                return el
            })

            setAssetsData(updatedTokens)
            setActivePayToken(updatedTokens[0])
            setJettonsLoading(false)
        } catch (error) {
            console.error(error)
            setJettonsLoading(false)
        } finally {
            setJettonsLoading(false)
        }
    }

    useEffect(() => {
        if (!rawAddress) {
            return
        }

        getJettons(rawAddress)
    }, [ rawAddress ])

    useEffect(() => {
        const isPaymentPage = localStorage.getItem('toPaymentPage')
        if (isPaymentPage) {
            setIsPaymentPage(JSON.parse(isPaymentPage))
        }
    }, [])

    const filteredAssets = assetsData?.filter(el => el.token.toLowerCase().includes(searchValue.toLowerCase()))

    return (
        <div className={s.method}>
            {!isPaymentLoading ? (
                <>
                    <Title className={s.methodTitle} variant="h2">
                        {t('subscribe.method.title')}
                    </Title>

                    <div className={s.methodInner}>
                        {amount && (
                            <div className={s.methodInnerTotal}>
                                <span>{t('subscribe.method.total')}</span> {parseFloat(String(amount)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                        )}

                        <div className={s.methodInputInner}>
                            <SvgSelector id="search" />
                            <Input
                                variant="white"
                                value={searchValue}
                                placeholder={t('common.search-token')}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
                            />
                            {searchValue.length >= 1 && (
                                <button className={s.methodInputClear} onClick={() => setSearchValue('')}>
                                    <SvgSelector id="clear" />
                                </button>
                            )}
                        </div>
                        <ul className={s.methodAssets}>
                            {jettonsLoading ? (
                                new Array(5).fill(null).map(_ => <MethodSkeleton key={v1()} isTg={isTg} />)
                            ) : (
                                <>
                                    {filteredAssets && filteredAssets?.length >= 1 ? (
                                        filteredAssets?.map(el => (
                                            <li
                                                className={s.methodAsset}
                                                key={v1()}
                                                onClick={() => setActivePayToken(el)}
                                            >
                                                <div className={s.methodAssetLeft}>
                                                    <div className={`${s.methodAssetSelect} ${el.token === activePayToken?.token ? s.methodAssetSelected : ''}`}>
                                                        {el.token === activePayToken?.token && (
                                                            <SvgSelector id="checked" />
                                                        )}
                                                    </div>
                                                    <div className={s.methodAssetLeftBody}>
                                                        <img src={el.tokenLogo} width="40" height="40" alt="Token Logo" />
                                                        <div>
                                                            <div className={s.methodAssetToken}>{el.token}</div>
                                                            <span className={s.methodAssetAmount}>{formatNumber(el.amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={s.methodAssetRight}>
                                                    <span>{parseFloat(String(el.amountUSD)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                                    <SvgSelector id="chevron-right" />
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <Text className={s.methodAssetsEmpty}>
                                            {t('common.not-found')}
                                        </Text>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </>
            ) : (
                <div className={s.loading}>
                    <Lottie
                        options={approveOptions}
                        height={140}
                        isClickToPauseDisabled={true}
                        width={140}
                    />
                    <Title variant="h1" className={s.transactionTitle}>{t('pay-await.title')} <span>DeVPN</span></Title>
                    <Text className={s.transactionDescription}>{t('pay-await.description')}</Text>
                </div>
            )}

        </div>
    )
}
