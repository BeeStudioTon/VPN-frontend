/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Lottie, { Options } from 'react-lottie'

import { Text, Title } from '@delab-team/de-ui'

import { Info } from './info'
import { Button } from '../../components/ui/button'
import { DownloadModal } from '../../components/download-modal'
import { Traffic } from '../../components/traffic'
import { ServersSelector } from '../../components/servers-selector'

import { VPN } from '../../logic/vpn'

import { UserType } from '../../@types/user'
import { GetActiveServerType } from '../../@types/get-active-server'
import { ServersType } from '../../@types/servers'

import { calculateDaysFromTimestamp } from '../../utils/formatDateFromTimestamp'
import { openTelegramLink } from '../../utils/open-telegram-link'

import { SvgSelector } from '../../assets/svg-selector'
import * as speedSticker from '../../assets/stickers/speed.json'
import * as sleepSticker from '../../assets/stickers/sleep.json'
import * as loadingSticker from '../../assets/stickers/loading.json'

import s from './home.module.scss'

interface HomeProps {
    user: UserType | undefined
    userLoading: boolean
    keysData: GetActiveServerType[] | undefined
    isTg: boolean
    isSkippedIntroduction: boolean
    rawAddress: string
}

const iconsTgStyles = { stroke: 'var(--tg-theme-button-text-color)' }
export const Home: FC<HomeProps> = ({ user, keysData, isSkippedIntroduction, userLoading, isTg, rawAddress }) => {
    const approveOptions: Options = {
        loop: true,
        autoplay: true,
        animationData: speedSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const approveOptions2: Options = {
        loop: true,
        autoplay: true,
        animationData: sleepSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const approveOptions3: Options = {
        loop: true,
        autoplay: true,
        animationData: loadingSticker,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
    }

    const { t } = useTranslation()

    const navigate = useNavigate()

    const vpn = new VPN()

    const [ showDownloadModal, setShowDownloadModal ] = useState<boolean>(false)

    // Servers Data
    const [ serverData, setServerData ] = useState<ServersType[]>([])
    const [ serverDataLoading, setServerDataLoading ] = useState<boolean>(false)

    // Selected Server
    const [ selectedServer, setSelectedServer ] = useState<ServersType | undefined>(undefined)

    // Connect Server
    const [ connectServerData, setConnectServerData ] = useState<GetActiveServerType | undefined>(undefined)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setServerDataLoading(true)
                const res = await vpn.getServers()
                setServerData(res)
                setSelectedServer(res[0])
            } catch (error) {
                console.log(error)
            } finally {
                setServerDataLoading(false)
            }
        }

        fetchData()
    }, [])

    async function createKey () {
        if (!selectedServer) return
        if (!connectServerData) {
            try {
                const keyData = await vpn.getKey(selectedServer?.id) as GetActiveServerType

                setConnectServerData(keyData)
            } catch (error) {
                console.error('Error fetching key:', error)
            }
        }
    }

    useEffect(() => {
        const connectServer = keysData?.find(el => el.id_server === selectedServer?.id)

        if (!connectServer) {
            createKey()
        } else {
            setConnectServerData(connectServer)
        }
    }, [ selectedServer ])

    const isWindows: boolean = navigator.platform.toUpperCase().indexOf('WIN') >= 0

    const handleConnect = (key: string) => {
        if (isWindows) {
            const encodedUrl = encodeURIComponent(key)
            const searchParams = new URLSearchParams()
            searchParams.append('key', encodedUrl)
            const queryString = searchParams.toString()
            window.open(`/redirect?${queryString}`, '_blank')
            return
        }

        openTelegramLink(key)
    }

    const handleConnectServer = async () => {
        if (!connectServerData) {
            console.error('connectServerData undefined')
            return
        }
        handleConnect(connectServerData.key_data)
    }

    const handleButton = () => {
        if (
            user?.user?.type_subscribe !== 0
            && user !== undefined
            && user?.user?.end_sub !== 1
        ) {
            handleConnectServer()
            return
        }

        localStorage.removeItem('hasPassedIntroduction')
        localStorage.setItem('toPaymentPage', 'true')
        localStorage.setItem('currentIntroductionStep', '2')
        window.location.href = '/introduction'
    }

    return (
        <>
            {showDownloadModal && (
                <DownloadModal
                    showDownloadModal={showDownloadModal}
                    setShowDownloadModal={setShowDownloadModal}
                />
            )}

            <Info rawAddress={rawAddress} />
            <div className={s.status}>
                {userLoading ? (
                    <>
                        <Lottie
                            options={approveOptions3}
                            height={190}
                            isClickToPauseDisabled={true}
                            width={190}
                        />
                        <Text className={s.loading}>{t('common.loading')}</Text>
                    </>
                ) : (
                    <>
                        {user?.user?.type_subscribe !== 0 && user !== undefined && user?.user?.end_sub !== 1 ? (
                            <>
                                <Lottie
                                    options={approveOptions}
                                    height={190}
                                    isClickToPauseDisabled={true}
                                    width={190}
                                />

                                <Title variant="h2" className={s.statusTitle} tgStyles={{ color: 'var(--tg-theme-button-color)' }}>{t('home.ready-to-connect')}</Title>
                                <Text className={s.statusText}>{t('home.traffic-update-in')} {calculateDaysFromTimestamp(user?.user?.date_subscribe)} {calculateDaysFromTimestamp(user?.user?.date_subscribe) > 1 ? t('home.days') : t('home.day')}</Text>
                            </>
                        ) : (
                            <>
                                <Lottie
                                    options={approveOptions2}
                                    height={190}
                                    isClickToPauseDisabled={true}
                                    width={190}
                                />

                                <Title variant="h2" className={s.statusTitle}>{t('common.not-active-plan')}</Title>
                                <Text className={s.statusText}>{t('common.choose-plan')}</Text>
                            </>
                        )}
                    </>
                )}
            </div>

            <ServersSelector
                serversData={serverData}
                selectedServer={selectedServer}
                setSelectedServer={setSelectedServer}
                isTg={isTg}
                userLoading={userLoading}
                isLoading={serverDataLoading}
            />

            <div className={s.connectInner}>
                <Button
                    className={s.connectButton}
                    onClick={handleButton}
                    disabled={userLoading}
                >
                    {userLoading ? t('common.loading') : (
                        user?.user?.type_subscribe !== 0 && user !== undefined && user?.user?.end_sub !== 1 ? t('common.connect') : t('common.select-plan')
                    )}
                </Button>
                {user?.user?.type_subscribe !== 0 && user !== undefined && user?.user?.end_sub !== 1 && <Button className={s.downloadButton} onClick={() => setShowDownloadModal(true)}><SvgSelector id="download" /></Button>}
            </div>

            <div className={s.traffic}>
                <Title variant="h3" className={s.trafficTitle}>
                    {t('home.traffic-title')}
                </Title>

                <Traffic limit={user?.infoUser.limit} used={user?.infoUser.used} isTg={isTg} userLoading={userLoading} />
                        
                {/* <button onClick={() => handleConnect('ss://y2hhy2hhmjatawv0zi1wb2x5mtmwntpwakn5bllyng5intm0tkjhwhhvchpp@178.62.200.20:51203/?outline=1')}>Open</button> */}
            </div>
        </>
    )
}
