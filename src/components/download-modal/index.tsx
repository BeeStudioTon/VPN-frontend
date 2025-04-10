import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Button, Li, Modal, Text, Title } from '@delab-team/de-ui'

import { DownloadData } from '../../mocks/download-data'

import { SvgSelector } from '../../assets/svg-selector'

import s from './download-modal.module.scss'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

interface DownloadModalProps {
    showDownloadModal: boolean
    setShowDownloadModal: (el: boolean) => void
}

declare global {
    interface Window {
        opera?: any;
        MSStream?: any;
    }
}

interface FilteredDataType {
    name: string
    link: string
    icon: React.ReactElement
}

const modalTgStyles = { backgroundColor: 'var(--tg-theme-bg-color)' }

export const DownloadModal: FC<DownloadModalProps> = ({ showDownloadModal, setShowDownloadModal }) => {
    const { t } = useTranslation()

    useEffect(() => {
        if (showDownloadModal) {
            window.document.body.style.overflow = 'hidden'
        }

        return () => {
            window.document.body.style.overflow = 'hidden'
        }
    }, [ showDownloadModal ])

    const handleCloseModal = () => {
        setShowDownloadModal(false)
        useHapticFeedback()
        window.document.body.style.overflow = 'auto'
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    let filteredData: FilteredDataType | undefined

    if (/android/i.test(userAgent)) {
        filteredData = DownloadData.find(el => el.name === 'Android')
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        filteredData = DownloadData.find(el => el.name === 'IOS')
    } else if (/Mac/.test(userAgent)) {
        filteredData = DownloadData.find(el => el.name === 'macOS')
    } else if (/Win/.test(userAgent)) {
        filteredData = DownloadData.find(el => el.name === 'Windows')
    } else if (/Linux/.test(userAgent)) {
        filteredData = DownloadData.find(el => el.name === 'Linux')
    } else {
        console.log('The operating system could not be determined.')
    }

    return (
        <div className={s.wrapper}>
            <Modal
                isOpen={showDownloadModal}
                onClose={handleCloseModal}
                isCloseButton={false}
                className={s.modal}
                tgStyles={{ modalContent: modalTgStyles }}
            >
                <div className={s.modalTop}>
                    <Button className={s.modalTopButton} tgStyles={{ color: 'var(--tg-theme-link-color)' }} onClick={() => {
                        handleCloseModal()
                    }}>
                        {t('common.close')}
                    </Button>
                </div>

                <Title variant="h1" className={s.modalTitle}>{t('download.title')}</Title>

                <Text className={s.modalDescription}>{t('download.description')}</Text>

                <ul className={s.downloadList}>
                    {DownloadData.map(item => (
                        <Li
                            key={item.name}
                            className={`${s.downloadItem} ${item === filteredData ? s.selected : ''}`}
                        >
                            <Link to={item.link || ''} target="_blank">
                                <div className={s.downloadItemInfo}>
                                    <span>{item.icon}</span>
                                    <Text className={s.downloadItemName}>{item.name}</Text>
                                    {item === filteredData && <SvgSelector id="check3" />}
                                </div>
                                <SvgSelector id="download2" />
                            </Link>
                        </Li>
                    ))}
                </ul>
            </Modal>
        </div>
    )
}
