/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTonConnectUI } from '@tonconnect/ui-react'

import { Title } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'
import { useTranslation } from 'react-i18next'
import TonWeb from 'tonweb'
import { Address, Contract, beginCell, fromNano, toNano } from '@ton/core'
import { ProviderTonConnect } from '@delab-team/ton-network-react'

import { Plan } from './plan'
import { Method } from './method'
import { Status } from '../../../../components/status'

import { VPN } from '../../../../logic/vpn'

import { SvgSelector } from '../../../../assets/svg-selector'

import { RatesType } from '../../../../@types/rates'
import { UserType } from '../../../../@types/user'
import { AssetType } from '../../../../@types/asset-type'

import { JettonWallet } from '../../../../utils/JettonWallet'
import { JettonMinter } from '../../../../utils/JettonMinter'

import s from './subscribe.module.scss'

const NEXT_STEP_COLOR = '#40a7e3'
const DISABLED_BUTTON_COLOR = '#78B5F9'
const ERROR_TEXT_COLOR = '#FF0026'

interface SubscribeProps {
    activeRate: RatesType | undefined
    setActiveRate: React.Dispatch<React.SetStateAction<RatesType | undefined>>
    currentStep: number
    isTg: boolean
    rawAddress: string
    user: UserType | undefined;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>
    handleIntroductionClose: () => void
}

export const Subscribe: FC<SubscribeProps> = ({ isTg, activeRate, setActiveRate, currentStep, setCurrentStep, rawAddress, user, handleIntroductionClose }) => {
    const { t } = useTranslation()

    const TgObj = WebAppSDK

    const vpn = new VPN()

    const [ payToken, setPayToken ] = useState<AssetType | undefined>(undefined)

    const [ isSuccessPay, setIsSuccessPay ] = useState<boolean>(true)
    const [ isPaymentLoading, setIsPaymentLoading ] = useState<boolean>(false)

    const [ tonConnectUI, setOptions ] = useTonConnectUI()

    setOptions({
        walletsListConfiguration: {
            includeWallets: [
                {
                    appName: 'dewallet',
                    name: 'DeWallet',
                    imageUrl: 'https://avatars.githubusercontent.com/u/116884789?s=200&v=4',
                    aboutUrl: 'https://wallet.tg/',
                    universalLink: 'https://t.me/delabtonbot?attach=wallet',
                    bridgeUrl: 'https://bridge.tonapi.io/bridge',
                    platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ]
                }
            ]
        }
    })

    async function sendTrans (id_user: number, currency: 'TON' | Address, amount: number) {
        const addressVPN = 'UQBZdjhaGPnVGVm-pr6msATng-wdVp1kuYRvQN-GBrVuhE66'
        if (currency === 'TON') {
            const a = new TonWeb.boc.Cell()
            a.bits.writeUint(0, 32)
            a.bits.writeString(id_user + '')
            const payload = TonWeb.utils.bytesToBase64(await a.toBoc())

            const tr =  {
                validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
                messages: [
                    {
                        address: addressVPN,
                        amount: toNano(amount).toString(),
                        payload
                    }
                ]
            }

            const tx = await tonConnectUI.sendTransaction(tr)
            return tx
        }
        const test = new ProviderTonConnect(tonConnectUI, false)
        const JettonMinterContract = new JettonMinter(currency)

        const jettonMinter = test.open(JettonMinterContract)

        try {
            const walletAddressUser = await jettonMinter.getWalletAddressOf(Address.parse(rawAddress))

            const JettonWalletContract = new JettonWallet(walletAddressUser)

            const jettonWallet = test.open(JettonWalletContract)

            await jettonWallet.sendTransfer(
                test.sender(),
                toNano('0.1'),
                toNano('0.08'),
                Address.parse(addressVPN),
                toNano(amount),
                beginCell().storeUint(0, 32).storeStringRefTail(id_user + '').endCell()
            )
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    // Pay function1
    async function handlePay () {
        if (!payToken || !activeRate) return
        TgObj.MainButton.hide()
        const reverseRate = 1 / Number(payToken.tokenPriceUSD)
        let amountInUsd
        const increasedAmount = Number(activeRate.price) * reverseRate * 1.05
        amountInUsd = increasedAmount.toFixed(2)

        const tr = await sendTrans(
            Number(user?.user.id),
            payToken?.token === 'TON' ? 'TON' : Address.parse(payToken!.tokenAddress[0]),
            Number(amountInUsd)
        )

        if (tr) {
            setIsPaymentLoading(true)
            TgObj.MainButton.color = '#78B5F9'
            TgObj.MainButton.disable()
            let interval: NodeJS.Timeout
            const isPaymentPage = localStorage.getItem('toPaymentPage') === 'true'

            interval = setInterval(async () => {
                const userData = await vpn.postAuth()

                if (userData?.user?.type_subscribe !== 0 && userData?.user?.type_subscribe !== 3) {
                    clearInterval(interval)
                    setIsPaymentLoading(false)
                    setIsSuccessPay(true)
                    TgObj.MainButton.color = '#40a7e3'
                    TgObj.MainButton.enable()
                    if (isPaymentPage) {
                        localStorage.removeItem('toPaymentPage')
                        localStorage.setItem('hasPassedIntroduction', 'true')
                        TgObj.showAlert(t('common.congratulations'))
                        handleIntroductionClose()
                    } else {
                        localStorage.setItem('currentIntroductionStep', '4')
                        TgObj.showAlert(t('common.congratulations'))
                        TgObj.MainButton.show()
                        window.location.href = '/introduction'
                    }
                }
            }, 5000)

            setTimeout(() => {
                clearInterval(interval)
                setIsPaymentLoading(false)
                TgObj.MainButton.color = '#40a7e3'
                TgObj.MainButton.enable()
                setIsSuccessPay(false)
                if (user?.user?.type_subscribe === 0) {
                    TgObj.showAlert('Error, please try again')
                    TgObj.MainButton.show()
                }
            }, 120000)
        } else {
            TgObj.MainButton.show()
            TgObj.showAlert('Error, please try again')
            setIsPaymentLoading(false)
            TgObj.MainButton.color = '#40a7e3'
            TgObj.MainButton.enable()
        }
    }

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
            if (!activeRate?.price) return
            if (activeRate?.price > Number(payToken?.amountUSD)) {
                TgObj.MainButton.text = t('common.insufficient-balance')
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
                return
            }
            const price = activeRate?.price

            if (price === 0) {
                try {
                    const activationResult = await vpn.activateFree()

                    if (activationResult) {
                        TgObj.showAlert(t('common.congratulations'))
                        localStorage.removeItem('skippedIntroduction')
                        localStorage.setItem('currentIntroductionStep', '4')
                        setIsSuccessPay(true)
                        setCurrentStep(4)
                    } else {
                        TgObj.showAlert(t('common.used-subscription'))
                    }
                } catch (error) {
                    console.error(error)
                }
            } else {
                localStorage.setItem('currentIntroductionStep', '3')
                localStorage.removeItem('skippedIntroduction')
                setCurrentStep(3)
            }
        } else if (currentStep === 3) {
            await handlePay()
        } else if (currentStep === 4) {
            if (isSuccessPay) {
                handleIntroductionClose()
            } else {
                localStorage.setItem('currentIntroductionStep', '3')
                window.location.pathname = '/'
            }
        }
    }

    useEffect(() => {
        enableBtn()

        TgObj.MainButton.onClick(handleBtn)

        return () => TgObj.MainButton.offClick(handleBtn)
    }, [ currentStep, activeRate, payToken, user, rawAddress ])

    const step: string = currentStep === 2 ? t('subscribe.steps.plan') : currentStep === 3 ? t('subscribe.steps.method') : currentStep === 4 ? t('subscribe.steps.confirm') : t('subscribe.unknown')

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
                            className={`${s.step} ${currentStep >= 4 ? s.stepActive : ''} ${!isSuccessPay ? s.stepError : ''}`}
                            style={{ color: !isSuccessPay ? ERROR_TEXT_COLOR : '' }}
                        ></div>
                    </div>
                </div>
            </div>

            {currentStep === 2 && <Plan
                activeRate={activeRate}
                setActiveRate={setActiveRate}
                isTg={isTg}
                handleIntroductionClose={handleIntroductionClose}
            />}

            {currentStep === 3 && <Method
                amount={activeRate?.price}
                activePayToken={payToken}
                setActivePayToken={setPayToken}
                currentStep={currentStep}
                rawAddress={rawAddress}
                user={user}
                // payment loading
                isPaymentLoading={isPaymentLoading}
                isTg={isTg}
            />}

            {currentStep === 4 && <Status isSuccess={isSuccessPay} />}
        </>
    )
}
