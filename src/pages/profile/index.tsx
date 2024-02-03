/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect, useState } from 'react'
import { Alert, Div, Text, Title } from '@delab-team/de-ui'
import { useNavigate } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import copy from 'copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import ReactCountryFlag from 'react-country-flag'
import { motion } from 'framer-motion'

import { UserType } from '../../@types/user'

import { SvgSelector } from '../../assets/svg-selector'

import s from './profile.module.scss'

interface ProfileProps {
    user: UserType | undefined
    rawAddress: string
    selectedLanguage: string
    setSelectedLanguage: (el: string) => void
}

export const Profile: FC<ProfileProps> = ({ rawAddress, user, selectedLanguage, setSelectedLanguage }) => {
    const { t } = useTranslation()

    const TgObj = WebApp

    const navigate = useNavigate()

    const [ isCopiedAddress, setIsCopiedAddress ] = useState<boolean>(false)
    const [ isCopiedUsername, setIsCopiedUsername ] = useState<boolean>(false)

    const [ failedLoadAvatar, setFailedLoadAvatar ] = useState<boolean>(false)

    const handlePrev = () => {
        TgObj.BackButton.hide()
        navigate('/')
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
    }

    const handleExit = () => {
        TgObj.showConfirm(t('common.you-sure'), (isConfirmed) => {
            if (isConfirmed) {
                handleNavigate()
            }
        })
    }

    const handleEditPlan = () => {
        TgObj.showConfirm(t('common.you-sure'), (isConfirmed) => {
            if (isConfirmed) {
                localStorage.removeItem('hasPassedIntroduction')
                localStorage.setItem('toPaymentPage', 'true')
                localStorage.setItem('currentIntroductionStep', '2')
                window.location.href = '/introduction'
            }
        })
    }

    return (
        <div>
            {isCopiedAddress && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedAddress(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: 'var(--tg-theme-button-color)' }}
                    className={s.alert}
                >
                    <span className={s.alertText}>{t('common.address-copied')}</span>
                </Alert>
            )}
            {isCopiedUsername && (
                <Alert
                    type="important"
                    onClose={() => setIsCopiedUsername(false)}
                    icon={<>📃</>}
                    autoCloseTimeout={1000}
                    position="top-right"
                    tgStyles={{ background: 'var(--tg-theme-button-color)' }}
                    className={s.alert}
                >
                    <span className={s.alertText}>{t('common.username-copied')}</span>
                </Alert>
            )}
            <div className={s.userTg}>
                <img
                    src={`https://t.me/i/userpic/320/${TgObj?.initDataUnsafe?.user?.username}.jpg`}
                    onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.currentTarget
                        if (target.naturalWidth === 0 || target.naturalHeight === 0) {
                            target.style.display = 'none'
                            setFailedLoadAvatar(true)
                        }
                    }}
                    alt="avatar"
                />
                {failedLoadAvatar && <div className={s.avatar}>{TgObj?.initDataUnsafe?.user?.username?.slice(0, 2)}</div>}
                <div>
                    <div className={s.name}>
                        <Div tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                            {TgObj?.initDataUnsafe?.user?.first_name}
                        </Div>
                        <Div tgStyles={{ color: 'var(--tg-theme-text-color)' }}>
                            {TgObj?.initDataUnsafe?.user?.last_name}
                        </Div>
                    </div>
                    <div className={s.username} onClick={() => setIsCopiedUsername(true)}>
                      @{TgObj?.initDataUnsafe?.user?.username}
                    </div>
                </div>
            </div>

            {rawAddress && (
                <>
                    <Title variant="h3" className={s.title}>
                        {t('common.address')}
                    </Title>
                    <div className={s.action}>
                        <div className={`${s.accountAction} ${s.accountAddress}`}  onClick={() => {
                            copy(rawAddress)
                            setIsCopiedAddress(true)
                        }}>
                            <div className={s.address}>{rawAddress} <SvgSelector id="copy" /></div>
                        </div>
                    </div>
                </>
            )}

            <Title variant="h3" className={s.title}>
                {t('common.language')}
            </Title>

            <div className={`${s.action}`}>
                <motion.button
                    className={s.language}
                    onClick={() => {
                        setSelectedLanguage('ru')
                        localStorage.setItem('i18nextLngOwn', 'ru')
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
                {/* @ts-ignore */}
                {rawAddress && (user?.user?.type_subscribe === 0 || user !== undefined || user?.user?.end_sub === 1) && (
                    <motion.button
                        className={`${s.actionButton}`}
                        onClick={handleEditPlan}
                        whileHover="hover"
                        initial="nonHover"
                    >
                        <SvgSelector id="usd2" />
                        <div className={s.actionButtonInner}>
                            <div className={`${s.accountAction} ${s.editPlan}`}>
                                {t('common.edit-plan')}
                            </div>
                        </div>
                    </motion.button>
                )}
                <motion.button
                    className={`${s.actionButton}`}
                    onClick={handleExit}
                    whileHover="hover"
                    initial="nonHover"
                >
                    <SvgSelector id="exit" />
                    <div className={s.actionButtonInner}>
                        <div className={`${s.accountAction} ${s.logout}`}>
                            {t('common.logout')}
                        </div>
                    </div>
                </motion.button>
            </div>
        </div>
    )
}
