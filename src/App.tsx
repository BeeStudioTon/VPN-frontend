/* eslint-disable import/namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import { FC, useEffect, useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTonAddress } from '@tonconnect/ui-react'

import { AppInner } from '@delab-team/de-ui'
import WebAppSDK from '@twa-dev/sdk'

import { Home } from './pages/home'
import { Introduction } from './pages/introduction'
import { Profile } from './pages/profile'
import { SomethingWentWrong } from './pages/something-went-wrong'
import { Redirect } from './pages/redirect'

import { ROUTES } from './utils/router'
import './utils/i18n'

import { VPN } from './logic/vpn'

import { UserType } from './@types/user'
import { KeyType } from './@types/get-keys'

import './index.scss'

declare global {
    interface Window {
        Telegram?: any;
    }
}

WebAppSDK.ready()

export const App: FC = () => {
    const [ firstRender, setFirstRender ] = useState<boolean>(false)
    const [ isTg, setIsTg ] = useState<boolean>(false)
    const TgObj = WebAppSDK

    // user
    const [ user, setUser ] = useState<UserType | null>(null)
    const [ userLoading, setUserLoading ] = useState<boolean>(false)
    const [ isError, setIsError ] = useState<boolean>(false)
    // user end

    const [ keysData, setKeysData ] = useState<KeyType[]>([])
    // Introduction
    const [ showIntroduction, setShowIntroduction ] = useState<boolean>(true)

    // Skipped introduction
    const [ isSkippedIntroduction, setIsSkippedIntroduction ] = useState<boolean>(false)

    const rawAddress = useTonAddress()

    const navigate = useNavigate()

    const vpn = new VPN()

    // fetch keys data
    const fetchData = useCallback(async () => {
        try {
            setUserLoading(true)

            const userData = await vpn.postAuth()
            if (!userData) {
                throw new Error('User data is not available')
            }

            const [ keysData, paymentData ] = await Promise.all([ vpn.getKeys(), vpn.checkPayment() ])

            setUser(userData)
            setIsError(false)
            setKeysData(keysData)
        } catch (error) {
            console.error('Error fetching data:', error)
            setIsError(true)
            navigate(ROUTES.SOMETHING_WENT_WRONG)
        } finally {
            setUserLoading(false)
        }
    }, [ navigate, vpn ])

    // init twa
    useEffect(() => {
        if (!firstRender && TgObj) {
            setFirstRender(true)

            const isTgCheck = window.Telegram?.WebApp.initData !== ''
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
                bodyStyle.setProperty(
                    'background-color',
                    'var(--tg-theme-secondary-bg-color)',
                    'important'
                )
            } else {
                navigate(ROUTES.SOMETHING_WENT_WRONG)
            }

            if (window.location.pathname !== ROUTES.INTRODUCTION) {
                if (!isTg) {
                    return
                }
                TgObj.requestWriteAccess()
            }
        }
    }, [ firstRender, isError, fetchData, navigate, TgObj ])

    // introduction check
    useEffect(() => {
        const isTgCheck = window.Telegram?.WebApp.initData !== ''
        const hasPassedIntroduction = localStorage.getItem('hasPassedIntroduction')

        if (window.location.pathname === ROUTES.REDIRECT) {
            return
        }

        if (!isTgCheck) {
            navigate(ROUTES.SOMETHING_WENT_WRONG)
            return
        }

        if (hasPassedIntroduction) {
            setShowIntroduction(false)
        } else {
            navigate(ROUTES.INTRODUCTION)
        }
    }, [ navigate ])

    // introduction skip check
    useEffect(() => {
        const hasSkippedIntroduction = localStorage.getItem('skippedIntroduction')

        if (hasSkippedIntroduction) {
            setIsSkippedIntroduction(true)
        }
    }, [])

    useEffect(() => {
        if (window.location.pathname === ROUTES.HOME) {
            TgObj.BackButton.hide()
        }
    }, [ window.location.pathname, TgObj ])

    // ===================================================
    const savedLanguage = localStorage.getItem('i18nextLng')
    const [ selectedLanguage, setSelectedLanguage ] = useState<string>(savedLanguage || 'en')

    const { i18n } = useTranslation()

    useEffect(() => {
        const initializeLanguage = async () => {
            const TgLanguage = TgObj?.initDataUnsafe?.user?.language_code
            let language

            const userDefinedLanguage = localStorage.getItem('i18nextLngOwn')

            if (userDefinedLanguage) {
                language = userDefinedLanguage
            } else if (TgLanguage) {
                const lowerCaseTgLanguage = TgLanguage.toLowerCase()

                if ([ 'ru', 'en' ].includes(lowerCaseTgLanguage)) {
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
    }, [ isTg, savedLanguage, TgObj ])

    useEffect(() => {
        i18n.changeLanguage(selectedLanguage)
        localStorage.setItem('i18nextLng', selectedLanguage)
    }, [ selectedLanguage, i18n ])

    //= =======================================================

    return (
        <AppInner isTg={isTg}>
            <div className="wrapper">
                {!showIntroduction ? (
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
                                />
                            }
                        />
                        <Route
                            path={ROUTES.INTRODUCTION}
                            element={
                                <Introduction
                                    rawAddress={rawAddress}
                                    user={user}
                                    keysData={keysData}
                                    isTg={isTg}
                                    setShowIntroduction={setShowIntroduction}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.PROFILE}
                            element={
                                <Profile
                                    rawAddress={rawAddress}
                                    selectedLanguage={selectedLanguage}
                                    setSelectedLanguage={setSelectedLanguage}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.SOMETHING_WENT_WRONG}
                            element={<SomethingWentWrong />}
                        />
                        <Route path={ROUTES.REDIRECT} element={<Redirect />} />
                        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                    </Routes>
                ) : (
                    <Routes>
                        <Route
                            path={ROUTES.INTRODUCTION}
                            element={
                                <Introduction
                                    rawAddress={rawAddress}
                                    user={user}
                                    keysData={keysData}
                                    isTg={isTg}
                                    setShowIntroduction={setShowIntroduction}
                                />
                            }
                        />
                        <Route
                            path={ROUTES.SOMETHING_WENT_WRONG}
                            element={<SomethingWentWrong />}
                        />
                        <Route path={ROUTES.REDIRECT} element={<Redirect />} />
                        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                    </Routes>
                )}
            </div>
        </AppInner>
    )
}
