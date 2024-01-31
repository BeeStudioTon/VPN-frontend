/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */
import { FC, useEffect, useState } from 'react'
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
import { GetActiveServerType } from './@types/get-active-server'

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
    const [ user, setUser ] = useState<UserType | undefined>(undefined)
    const [ userLoading, setUserLoading ] = useState<boolean>(false)
    const [ isError, setIsError ] = useState<boolean>(false)
    // user end

    const [ keysData, setKeysData ] = useState<GetActiveServerType[] | undefined>(undefined)

    // Introduction
    const [ showIntroduction, setShowIntroduction ] = useState<boolean>(true)

    // Skipped introduction
    const [ isSkippedIntroduction, setIsSkippedIntroduction ] = useState<boolean>(false)

    const rawAddress = useTonAddress()

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
            if (window.location.pathname !== '/introduction') {
                TgObj.requestWriteAccess()
            }

            if (isTgCheck) {
                TgObj.ready()
                TgObj.enableClosingConfirmation()
                TgObj.expand()
                setIsTg(true)

                fetchData()

                bodyStyle.backgroundColor = 'var(--tg-theme-secondary-bg-color)'
                bodyStyle.setProperty('background-color', 'var(--tg-theme-secondary-bg-color)', 'important')
            }
        }

        vpn.getAutoKey()
    }, [])

    // introduction check
    useEffect(() => {
        const hasPassedIntroduction = localStorage.getItem('hasPassedIntroduction')

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
                            />}
                        />
                        <Route path={ROUTES.PROFILE} element={<Profile rawAddress={rawAddress} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} /> } />
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
                            />}
                        />
                        <Route element={<SomethingWentWrong />} path={ROUTES.SOMETHING_WENT_WRONG} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </div>
        </AppInner>
    )
}
