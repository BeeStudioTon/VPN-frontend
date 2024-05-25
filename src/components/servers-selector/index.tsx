/* eslint-disable max-len */
import React, { FC, useState, useRef, useEffect } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { Text } from '@delab-team/de-ui'
import { motion, AnimatePresence } from 'framer-motion'

import { ServerData } from '../../@types/servers'

import { SvgSelector } from '../../assets/svg-selector'

import { SkeletonInfo } from '../skeleton-info'

import s from './servers-selector.module.scss'

interface ServersSelectorProps {
    serversData: ServerData[];
    selectedServer: ServerData | null
    isLoading: boolean
    isTg: boolean
    userLoading: boolean
    setSelectedServer: (el: ServerData | null) => void;
}

export const ServersSelector: FC<ServersSelectorProps> = ({ serversData, selectedServer, setSelectedServer, isLoading, isTg, userLoading }) => {
    if (!selectedServer) return <></>

    const [ isDropdownOpen, setIsDropdownOpen ] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)

    const handleServerSelection = (server: ServerData) => {
        setSelectedServer(server)
        setIsDropdownOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const filteredServersData = serversData.filter(el => el.ip !== selectedServer.ip)

    return (
        <div className={s.serversSelector}>
            <div
                className={`${s.selectedServer} ${s.serverItem}`}
                onClick={() => !userLoading && setIsDropdownOpen(!isDropdownOpen)}
                ref={buttonRef}
            >
                {isLoading ? (
                    <>
                        <div className={s.serverItemLeft}>
                            <div className={s.serverItemFlag}>

                            </div>
                            <SkeletonInfo height='23' isTg={isTg} widthHalf />
                        </div>
                        <div className={s.serverItemRight}>
                            <SkeletonInfo height='23' isTg={isTg} />
                            <motion.div
                                initial={false}
                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SvgSelector id="chevron-bottom" />
                            </motion.div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={s.serverItemLeft}>
                            <ReactCountryFlag
                                countryCode={selectedServer?.geo}
                                svg
                                style={{
                                    width: '2em',
                                    height: '2em'
                                }}
                                title="US"
                            />
                            <Text className={s.serverItemServer}>
                                {selectedServer.name_server}
                            </Text>
                        </div>
                        <div className={s.serverItemRight}>
                            <div className={s.serverItemPing}>
                                <div className={`${s.serverItemPing} ${Number(selectedServer.load_server) > 90 ? s.serverItemPingRed : ''}`}>
                                    {selectedServer.load_server} ms
                                </div>
                            </div>
                            <motion.div
                                initial={false}
                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SvgSelector id="chevron-bottom" />
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        ref={dropdownRef}
                        className={s.serverDropdown}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {filteredServersData.map(server => (
                            <div
                                key={server.id}
                                className={s.serverItem}
                                onClick={() => handleServerSelection(server)}
                            >
                                <div className={s.serverItemLeft}>
                                    <ReactCountryFlag
                                        countryCode={server?.geo}
                                        svg
                                        style={{
                                            width: '2em',
                                            height: '2em'
                                        }}
                                        title="US"
                                    />
                                    <Text className={s.serverItemServer}>
                                        {server.name_server}
                                    </Text>
                                </div>
                                <div className={s.serverItemRight}>
                                    <div className={`${s.serverItemPing} ${Number(server.load_server) > 90 ? s.serverItemPingRed : ''}`}>
                                        {server.load_server} ms
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
