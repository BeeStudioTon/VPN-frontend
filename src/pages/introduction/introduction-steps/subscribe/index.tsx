/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'

import { Title } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'
import { useTranslation } from 'react-i18next'
import TonWeb from 'tonweb'
import { Address, beginCell, toNano } from '@ton/core'
import { ProviderTonConnect } from '@delab-team/ton-network-react'

import { useTonConnectUI } from '@tonconnect/ui-react'
import { Plan } from './plan'
import { Method } from './method'
import { Status } from '../../../../components/status'

import { VPN } from '../../../../logic/vpn'

import { SvgSelector } from '../../../../assets/svg-selector'

import { RatesType } from '../../../../@types/rates'
import { UserType } from '../../../../@types/user'
import { AssetType } from '../../../../@types/asset-type'

import { calculateDaysFromTimestamp } from '../../../../utils/formatDateFromTimestamp'
import { resolveJettonAddressFor, sendJettonToBoc } from '../../../../utils/sendJetton'

import s from './subscribe.module.scss'
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback'

const NEXT_STEP_COLOR = '#40a7e3'
const ERROR_TEXT_COLOR = '#FF0026'

interface SubscribeProps {
    activeRate: RatesType | undefined;
    setActiveRate: React.Dispatch<React.SetStateAction<RatesType | undefined>>;
    currentStep: number;
    isTg: boolean;
    rawAddress: string;
    user: UserType | null;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    handleIntroductionClose: () => void;
}

export const Subscribe: FC<SubscribeProps> = ({
    isTg,
    activeRate,
    setActiveRate,
    currentStep,
    setCurrentStep,
    rawAddress,
    user,
    handleIntroductionClose
}) => {
    const { t } = useTranslation()

    const TgObj = WebAppSDK

    const vpn = new VPN()

    const [ payToken, setPayToken ] = useState<AssetType | undefined>(undefined)

    const [ assetsData, setAssetsData ] = useState<AssetType[] | undefined>(undefined)

    const [ isSuccessPay, setIsSuccessPay ] = useState<boolean>(true)
    const [ isPaymentLoading, setIsPaymentLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    const sendTrans = async (id_user: number, currency: string, amount: number): Promise<boolean> => {
        const addressVPN = 'UQDILBLIPwj7cFA0SjEzOXdqZ7m-VpfsbAjilWJs_wWkuwjM'
        const TRANSACTION_FEE = 0.18
        const VALIDITY_DURATION = 60

        try {
            TgObj.MainButton.showProgress()
            TgObj.MainButton.disable()

            let payload

            if (currency === 'TON') {
                const cell = new TonWeb.boc.Cell()
                cell.bits.writeUint(0, 32)
                cell.bits.writeString(id_user.toString())
                payload = TonWeb.utils.bytesToBase64(await cell.toBoc())
            } else {
                payload = sendJettonToBoc(
                    {
                        to: addressVPN,
                        amount: toNano(amount).toString(),
                        comment: id_user.toString()
                    },
                    addressVPN
                )
            }

            let address
            if (currency !== 'TON') {
                const jettonWallet = await resolveJettonAddressFor(
                    Address.parse(currency).toString(),
                    Address.parse(rawAddress).toString()
                )

                if (!jettonWallet) {
                    console.error('No jetton wallet address')
                    return false
                }
                address = Address.parse(jettonWallet).toString()
            }

            const messages = [
                {
                    address: currency === 'TON' ? addressVPN : address,
                    amount: toNano(currency === 'TON' ? amount : TRANSACTION_FEE).toString(),
                    payload
                }
            ].filter(Boolean) as { address: string; amount: string; payload: string }[]

            const tr = {
                validUntil: Math.floor(Date.now() / 1000) + VALIDITY_DURATION,
                messages
            }

            await tonConnectUI.sendTransaction(tr)

            return true
        } catch (error) {
            console.error('Transaction error:', error)
            return false
        } finally {
            TgObj.MainButton.hideProgress()
            TgObj.MainButton.enable()
        }
    }

    // Pay function1
    async function handlePay () {
        if (!payToken || !activeRate) return
        TgObj.MainButton.text = t('common.loading')
        TgObj.MainButton.color = '#78B5F9'
        TgObj.MainButton.disable()
        useHapticFeedback()
        // const invoice = await vpn.getInvoice(
        //     String(activeRate?.id),
        //     payToken.tokenAddress[0],
        //     rawAddress
        // )
        TgObj.MainButton.hide()

        // const tr = await sendTrans(
        //     Number(WebAppSDK.initDataUnsafe.user?.id),
        //     payToken?.token === 'TON' ? 'TON' : payToken!.tokenAddress[0],
        //     invoice.tokenAmount
        // )

        // if (tr) {
        //     setIsPaymentLoading(true)
        //     TgObj.MainButton.color = '#78B5F9'
        //     TgObj.MainButton.disable()
        //     let interval: NodeJS.Timeout
        //     const isPaymentPage = localStorage.getItem('toPaymentPage') === 'true'

        //     interval = setInterval(async () => {
        //         const userData = await vpn.checkPayment()

        //         if (calculateDaysFromTimestamp(Date.parse(userData?.activeTo ?? '0') / 1000) >= 1) {
        //             clearInterval(interval)
        //             setIsPaymentLoading(false)
        //             setIsSuccessPay(true)
        //             TgObj.MainButton.color = '#40a7e3'
        //             TgObj.MainButton.enable()
        //             if (isPaymentPage) {
        //                 localStorage.removeItem('toPaymentPage')
        //                 localStorage.setItem('hasPassedIntroduction', 'true')
        //                 TgObj.showAlert(t('common.congratulations'))
        //                 handleIntroductionClose()
        //             } else {
        //                 localStorage.setItem('currentIntroductionStep', '4')
        //                 TgObj.showAlert(t('common.congratulations'))
        //                 TgObj.MainButton.show()
        //                 window.location.href = '/introduction'
        //             }
        //         }
        //     }, 5000)

        //     setTimeout(async () => {
        //         const user = await vpn.postAuth()
        //         clearInterval(interval)
        //         setIsPaymentLoading(false)
        //         TgObj.MainButton.color = '#40a7e3'
        //         localStorage.setItem('currentIntroductionStep', '4')
        //         TgObj.MainButton.enable()
        //         setIsSuccessPay(false)
        //         if (user?.user?.activeTariff?.id === '0' || user?.user?.activeTariff === null) {
        //             TgObj.showAlert('Error, please try again')
        //             TgObj.MainButton.show()
        //         }
        //     }, 120000)
        // } else {
        //     TgObj.MainButton.show()
        //     TgObj.showAlert('Error, please try again')
        //     setIsPaymentLoading(false)
        //     TgObj.MainButton.color = '#40a7e3'
        //     TgObj.MainButton.enable()
        // }
    }

    const ton = assetsData?.find(el => el.token === 'TON')

    const enableBtn = () => {
        TgObj.MainButton.show()

        if (currentStep === 2) {
            if (!rawAddress) {
                TgObj.MainButton.text = t('common.connect-btn')
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
                return
            }

            if (activeRate) {
                TgObj.MainButton.text = t('common.next')
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
            } else {
                TgObj.MainButton.text = t('subscribe.select-plan')
                TgObj.MainButton.color = '#78B5F9'
                TgObj.MainButton.disable()
            }
        } else if (currentStep === 3) {
            if (!activeRate?.priceDollar) return

            if (activeRate?.priceDollar > Number(payToken?.amountUSD)) {
                TgObj.MainButton.text = t('common.insufficient-balance')
                TgObj.MainButton.color = '#78B5F9'
                TgObj.MainButton.disable()
            } else if (Number(ton?.amount) < 0.2) {
                TgObj.MainButton.text = t('common.insufficient-balance2')
                TgObj.MainButton.color = '#78B5F9'
                TgObj.MainButton.disable()
            } else if (!user || !rawAddress) {
                TgObj.MainButton.text = t('common.loading')
                TgObj.MainButton.color = '#78B5F9'
                TgObj.MainButton.disable()
            } else {
                TgObj.MainButton.text = t('common.pay-btn')
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
            }
        } else if (currentStep === 4) {
            if (isSuccessPay) {
                TgObj.MainButton.text = t('common.return-to-main')
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
            } else {
                TgObj.MainButton.text = t('common.try-again')
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
            }
        }
    }

    const handleBtn = async () => {
        if (currentStep === 2) {
            if (!rawAddress) {
                tonConnectUI.connectWallet()
                useHapticFeedback()
                return
            }
            const price = activeRate?.priceDollar

            if (price === 0) {
                // try {
                //     const activationResult = await vpn.activateFree()

                //     if (activationResult) {
                //         TgObj.showAlert(t('common.congratulations'))
                //         localStorage.removeItem('skippedIntroduction')
                //         localStorage.setItem('currentIntroductionStep', '4')
                //         TgObj.MainButton.show()
                //         window.location.href = '/introduction'
                //         useHapticFeedback()
                //     }
                // } catch (error) {
                //     TgObj.showAlert(t('common.used-subscription'))
                //     console.error(error)
                // }
            } else {
                localStorage.setItem('currentIntroductionStep', '3')
                localStorage.removeItem('skippedIntroduction')
                useHapticFeedback()
                setCurrentStep(3)
            }
        } else if (currentStep === 3) {
            await handlePay()
            useHapticFeedback()
        } else if (currentStep === 4) {
            if (isSuccessPay) {
                handleIntroductionClose()
                useHapticFeedback()
            } else {
                localStorage.setItem('currentIntroductionStep', '3')
                window.location.pathname = '/'
                useHapticFeedback()
            }
        }
    }

    useEffect(() => {
        enableBtn()

        TgObj.MainButton.onClick(handleBtn)

        // return () => TgObj.MainButton.offClick(handleBtn)
    }, [ currentStep, activeRate, payToken, user, rawAddress ])

    const step: string =        currentStep === 2
        ? t('subscribe.steps.plan')
        : currentStep === 3
            ? t('subscribe.steps.method')
            : currentStep === 4
                ? t('subscribe.steps.confirm')
                : t('subscribe.unknown')

    return (
        <>
            <Title variant="h2" className={s.title}>
                {t('subscribe.title')}
            </Title>
            <div className={s.top}>
                <div className={s.topInfo}>
                    {t('common.step')} {currentStep - 1}: {step}
                </div>
                <div className={s.topInner}>
                    <div className={s.topInner}>
                        <div
                            className={`${s.step} ${s.stepActive} ${
                                currentStep >= 3 ? s.stepChecked : ''
                            }`}
                        >
                            {currentStep >= 3 && <SvgSelector id="check2" />}
                        </div>
                        <div
                            className={s.divider}
                            style={{ background: currentStep >= 3 ? NEXT_STEP_COLOR : '' }}
                        />
                        <div
                            className={`${s.step} ${currentStep >= 3 ? s.stepActive : ''} ${
                                currentStep === 4 ? s.stepChecked : ''
                            }`}
                        >
                            {currentStep >= 4 && <SvgSelector id="check2" />}
                        </div>
                        <div
                            className={s.divider}
                            style={{ background: currentStep >= 4 ? NEXT_STEP_COLOR : '' }}
                        />
                        <div
                            className={`${s.step} ${currentStep >= 4 ? s.stepActive : ''} ${
                                !isSuccessPay ? s.stepError : ''
                            }`}
                            style={{ color: !isSuccessPay ? ERROR_TEXT_COLOR : '' }}
                        ></div>
                    </div>
                </div>
            </div>

            {currentStep === 2 && (
                <Plan
                    activeRate={activeRate}
                    setActiveRate={setActiveRate}
                    isTg={isTg}
                    handleIntroductionClose={handleIntroductionClose}
                    TgObj={TgObj}
                />
            )}

            {currentStep === 3 && (
                <Method
                    amount={activeRate?.priceDollar}
                    activePayToken={payToken}
                    setActivePayToken={setPayToken}
                    currentStep={currentStep}
                    rawAddress={rawAddress}
                    user={user}
                    // payment loading
                    isPaymentLoading={isPaymentLoading}
                    isTg={isTg}
                    assetsData={assetsData}
                    setAssetsData={setAssetsData}
                />
            )}

            {currentStep === 4 && <Status isSuccess={isSuccessPay} />}
        </>
    )
}
