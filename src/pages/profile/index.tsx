/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect, useState } from 'react'
import { Alert, Div, Text, Title } from '@delab-team/de-ui'
import { useNavigate } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import ReactCountryFlag from 'react-country-flag'
import { motion } from 'framer-motion'

import { SvgSelector } from '../../assets/svg-selector'

import s from './profile.module.scss'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface ProfileProps {
    selectedLanguage: string
    setSelectedLanguage: (el: string) => void
}

export const Profile: FC<ProfileProps> = ({ selectedLanguage, setSelectedLanguage }) => {
    const { t } = useTranslation()

    const TgObj = WebApp

    const navigate = useNavigate()

    const [ isCopiedUsername, setIsCopiedUsername ] = useState<boolean>(false)

    const handlePrev = () => {
        TgObj.BackButton.hide()
        navigate('/')
        useHapticFeedback()
    }

    useEffect(() => {
        TgObj.BackButton.show()
        TgObj.BackButton.onClick(handlePrev)
        return () => {
            TgObj.BackButton.offClick(handlePrev)
        }
    }, [])

    const handleNavigate = () => {
        window.localStorage.clear()
        window.location.pathname = '/'
        useHapticFeedback()
    }

    const handleExit = () => {
        // TgObj.showConfirm(t('common.you-sure'), (isConfirmed) => {
        //     if (isConfirmed) {
        //         handleNavigate()
        //     }
        // })

        TgObj.addToHomeScreen()
    }

    return (
        <div>
            {isCopiedUsername && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedUsername(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: '#dab200' }}
                    className={s.alert}
                >
                    <span className={s.alertText}>{t('common.username-copied')}</span>
                </Alert>
            )}
            <div className={s.userTg}>
                <div className={s.userTgInner}>
                    <img
                        src={`https://t.me/i/userpic/320/${TgObj?.initDataUnsafe?.user?.username}.jpg`}
                        onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.currentTarget
                            if (target.naturalWidth === 0 || target.naturalHeight === 0) {
                                target.style.display = 'none'
                            }
                        }}
                        alt=""
                    />
                    {<div className={s.avatar}>{TgObj?.initDataUnsafe?.user?.username?.slice(0, 2)}</div>}
                </div>
                <div>
                    <div className={s.name}>
                        <Div tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                            {TgObj?.initDataUnsafe?.user?.first_name}
                        </Div>
                        <Div tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                            {TgObj?.initDataUnsafe?.user?.last_name}
                        </Div>
                    </div>
                    {TgObj?.initDataUnsafe?.user?.username && TgObj?.initDataUnsafe?.user?.username?.length >= 1 && (
                        <div className={s.username} onClick={() => {
                            setIsCopiedUsername(true)
                            useHapticFeedback()
                        }}>
                            @{TgObj?.initDataUnsafe?.user?.username}
                        </div>
                    )}
                </div>
            </div>
            <Title variant="h3" className={s.title}>
                {t('common.language')}
            </Title>

            <div className={`${s.action}`}>
                <motion.button
                    className={s.language}
                    onClick={() => {
                        setSelectedLanguage('ru')
                        localStorage.setItem('i18nextLngOwn', 'ru')
                        useHapticFeedback()
                    }}
                    whileHover="hover"
                    initial="nonHover"
                >
                    <div className={s.languageBody}>
                        <ReactCountryFlag
                            countryCode="ru"
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                            svg
                        />
                        <Text className={s.languageText}>
                          Русский
                        </Text>
                    </div>
                    {selectedLanguage === 'ru' && (
                        <SvgSelector id="check3" />
                    )}
                </motion.button>
                <motion.button
                    className={s.language}
                    onClick={() => {
                        setSelectedLanguage('en')
                        localStorage.setItem('i18nextLngOwn', 'en')
                        useHapticFeedback()
                    }}
                    whileHover="hover"
                    initial="nonHover"
                >
                    <div className={s.languageBody}>
                        <ReactCountryFlag
                            countryCode="us"
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                            svg
                        />
                        <Text className={s.languageText}>
                          English
                        </Text>
                    </div>
                    {selectedLanguage === 'en' && (
                        <SvgSelector id="check3" />
                    )}
                </motion.button>
            </div>

            <Title variant="h3" className={s.title}>
                {t('common.actions')}
            </Title>

            <div className={`${s.action}`}>
            <motion.button
                    className={`${s.actionButton}`}
                    whileHover="hover"
                    initial="nonHover"
                    onClick={() => {
                        window.open('https://t.me/beevpnpro', '_blank')
                        useHapticFeedback()
                    }}
                >
                    <SvgSelector id="link" />
                    <div className={s.actionButtonInner}>
                        <div className={`${s.accountAction} ${s.actionText}`}>
                            BeeVPN Channel
                        </div>
                    </div>
                </motion.button>
                <motion.button
                    className={`${s.actionButton}`}
                    whileHover="hover"
                    initial="nonHover"
                    onClick={() => {
                        window.open('https://t.me/beevpnchat', '_blank')
                        useHapticFeedback()
                    }}
                >
                    <SvgSelector id="link" />
                    <div className={s.actionButtonInner}>
                        <div className={`${s.accountAction} ${s.actionText}`}>
                            {t('common.support')}
                        </div>
                    </div>
                </motion.button>

                <motion.button
                    className={`${s.actionButton}`}
                    onClick={handleExit}
                    whileHover="hover"
                    initial="nonHover"
                >
                    <SvgSelector id="download2" />
                    <div className={s.actionButtonInner}>
                        <div className={`${s.accountAction} ${s.logout}`}>
                            {t('common.addhome')}
                        </div>
                    </div>
                </motion.button>
            </div>
        </div>
    )
}
