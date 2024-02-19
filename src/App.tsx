/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { FC, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TonConnectUI } from 'delab-tonconnect-ui'

// import { useTonAddress } from '@tonconnect/ui-react'
import { AppInner } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'

import { Address } from 'ton-core'
import { Home } from './pages/home'
import { Introduction } from './pages/introduction'
import { Profile } from './pages/profile'
import { SomethingWentWrong } from './pages/something-went-wrong'
import { Redirect } from './pages/redirect'

import { ROUTES } from './utils/router'
import './utils/i18n'

import { VPN } from './logic/vpn'

import { UserType } from './@types/user'
import { GetActiveServerType } from './@types/get-active-server'

import './index.scss'

declare global {
    interface Window {
        Telegram?: any;
    }
}

const tonConnectUI = new TonConnectUI({ manifestUrl: 'https://72a879bd.manifests.pages.dev/devpn.txt' })

tonConnectUI.uiOptions = {
    walletsListConfiguration: {
        includeWallets: [
            {
                appName: 'dewallet',
                name: 'DeWallet',
                imageUrl: 'https://avatars.githubusercontent.com/u/116884789?s=200&v=4',
                aboutUrl: 'https://wallet.tg/',
                universalLink: 'https://t.me/delabtonbot/wallet?attach=wallet', // https://t.me/delabtonbot/wallet 'https://v2.delabwallet.com/tonconnect' https://t.me/wallet?attach=wallet,
                bridgeUrl: 'https://bridge.tonapi.io/bridge',
                platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ]
            }
        ]
    }
}

WebAppSDK.ready()
export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)
    const TgObj = WebAppSDK

    // user
    const [ user, setUser ] = useState<UserType | undefined>(undefined)
    const [ userLoading, setUserLoading ] = useState<boolean>(false)
    const [ isError, setIsError ] = useState<boolean>(false)
    // user end

    const [ keysData, setKeysData ] = useState<GetActiveServerType[] | undefined>(undefined)

    // Introduction
    const [ showIntroduction, setShowIntroduction ] = useState<boolean>(true)

    // Skipped introduction
    const [ isSkippedIntroduction, setIsSkippedIntroduction ] = useState<boolean>(false)

    const rawAddress: string = tonConnectUI.account?.address ? Address.parse(tonConnectUI.account?.address).toString({ bounceable: false }) : ''

    const navigate = useNavigate()

    const vpn = new VPN()

    // fetch keys data
    async function fetchData () {
        setUserLoading(true)
        const userData = await vpn.postAuth().finally(() => setUserLoading(false))
        setUser(userData as UserType)

        if (!userData) {
            setIsError(true)
            navigate(ROUTES.SOMETHING_WENT_WRONG)
        } else {
            setIsError(false)
        }

        const keysData = await vpn.getKeys()
        setKeysData(keysData as GetActiveServerType[])
    }

    // init twa
    useEffect(() => {
        if (!firstRender && TgObj) {
            setFirstRender(true)

            const isTgCheck = window.Telegram.WebApp.initData !== ''
            const bodyStyle = document.body.style

            if (window.location.pathname === ROUTES.SOMETHING_WENT_WRONG && !isError) {
                TgObj.MainButton.hide()
                navigate('/')
            }

            if (!isTgCheck && window.location.pathname === '/redirect') {
                return
            }

            if (isTgCheck) {
                TgObj.ready()
                TgObj.enableClosingConfirmation()
                TgObj.expand()
                setIsTg(true)

                fetchData()

                bodyStyle.backgroundColor = 'var(--tg-theme-secondary-bg-color)'
                bodyStyle.setProperty('background-color', 'var(--tg-theme-secondary-bg-color)', 'important')
            } else {
                navigate('/something_went_wrong')
            }

            if (window.location.pathname !== '/introduction') {
                if (!isTg) {
                    return
                }
                TgObj.requestWriteAccess()
            }
        }
        vpn.getAutoKey()
    }, [])

    // introduction check
    useEffect(() => {
        const isTgCheck = window.Telegram.WebApp.initData !== ''
        const hasPassedIntroduction = localStorage.getItem('hasPassedIntroduction')

        if (window.location.pathname === '/redirect') {
            return
        }

        if (!isTgCheck) {
            navigate('/something_went_wrong')
            return
        }

        if (hasPassedIntroduction) {
            setShowIntroduction(false)
        } else {
            navigate(ROUTES.INTRODUCTION)
        }
    }, [])

    // introduction skip check
    useEffect(() => {
        const hasSkippedIntroduction = localStorage.getItem('skippedIntroduction')

        if (hasSkippedIntroduction) {
            setIsSkippedIntroduction(true)
        }
    }, [])

    useEffect(() => {
        if (window.location.pathname === '/') {
            TgObj.BackButton.hide()
        }
    }, [ window.location.pathname ])

    //= =======================================================================================================================================================
    const savedLanguage = localStorage.getItem('i18nextLng')
    const [ selectedLanguage, setSelectedLanguage ] = useState<string>(savedLanguage || 'en')

    const { i18n, t } = useTranslation()

    useEffect(() => {
        const initializeLanguage = async () => {
            const TgLanguage = TgObj?.initDataUnsafe?.user?.language_code
            let language

            const userDefinedLanguage = localStorage.getItem('i18nextLngOwn')

            if (userDefinedLanguage) {
                language = userDefinedLanguage
            } else if (TgLanguage) {
                const lowerCaseTgLanguage = TgLanguage.toLowerCase()

                if (lowerCaseTgLanguage === 'ru' || lowerCaseTgLanguage === 'en') {
                    language = lowerCaseTgLanguage
                } else {
                    language = 'en'
                }
            } else {
                language = 'en'
            }

            setSelectedLanguage(language)
        }

        if (isTg && !savedLanguage) {
            initializeLanguage()
        }
    }, [ isTg ])

    useEffect(() => {
        i18n.changeLanguage(selectedLanguage)
        localStorage.setItem('i18nextLng', selectedLanguage)
    }, [ selectedLanguage, i18n ])

    //= ========================================================================================================================================================
    console.log(window.location.pathname)

    return (
        <AppInner isTg={isTg}>
            <div className="wrapper">
                {!showIntroduction && (
                    <Routes>
                        <Route
                            path={ROUTES.HOME}
                            element={
                                <Home
                                    rawAddress={rawAddress}
                                    isSkippedIntroduction={isSkippedIntroduction}
                                    isTg={isTg}
                                    keysData={keysData}
                                    user={user}
                                    userLoading={userLoading}
                                />}
                        />
                        <Route path={ROUTES.INTRODUCTION} element={
                            <Introduction
                                rawAddress={rawAddress}
                                user={user}
                                keysData={keysData}
                                isTg={isTg}
                                setShowIntroduction={setShowIntroduction}
                                tonConnectUI={tonConnectUI}
                            />}
                        />
                        <Route path={ROUTES.PROFILE} element={<Profile user={user} rawAddress={rawAddress} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} /> } />
                        <Route element={<SomethingWentWrong />} path={ROUTES.SOMETHING_WENT_WRONG} />
                        <Route element={<Redirect />} path={ROUTES.REDIRECT} />
                        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                    </Routes>
                )}

                {showIntroduction && (
                    <Routes>
                        <Route path={ROUTES.INTRODUCTION} element={
                            <Introduction
                                rawAddress={rawAddress}
                                user={user}
                                keysData={keysData}
                                isTg={isTg}
                                setShowIntroduction={setShowIntroduction}
                                tonConnectUI={tonConnectUI}
                            />}
                        />
                        <Route element={<SomethingWentWrong />} path={ROUTES.SOMETHING_WENT_WRONG} />
                        <Route element={<Redirect />} path={ROUTES.REDIRECT} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </div>
        </AppInner>
    )
}
