/* eslint-disable max-len */
import React, { FC } from 'react'

import { formatDataSize } from '../../utils/format-data-size'

import s from './traffic.module.scss'
import { SvgSelector } from '../../assets/svg-selector'
import { SkeletonInfo } from '../skeleton-info'

interface TrafficProps {
    limit: number | undefined;
    used: number | undefined;
    userLoading: boolean
    isTg: boolean
}

export const Traffic: FC<TrafficProps> = ({ limit = 0, used = 0, userLoading, isTg }) => {
    const percentageUsed = (limit / used) * 100

    let backgroundStyle

    if (percentageUsed <= 10) {
        backgroundStyle = '#F95454'
    } else if (percentageUsed >= 10 && percentageUsed <= 70) {
        backgroundStyle = '#F67B22'
    } else {
        backgroundStyle = 'var(--tg-theme-button-color)'
    }

    return (
        <div className={s.trafficContainer}>
            <div className={s.usageInfo}>
                <div className={s.usageData}>
                    <SvgSelector id="earth" />
                    <div className={s.usageDataInfo}>
                        {userLoading ? <SkeletonInfo widthHalf isTg={isTg} /> : (
                            <span>{formatDataSize(used).replace('.', '.')}</span>
                        )}
                        <span> / </span>
                        {userLoading ? <SkeletonInfo widthHalf isTg={isTg} /> : (
                            <span>{formatDataSize(limit).replace('.', '.')}</span>
                        )}
                    </div>
                </div>
                {/* <button className={s.usageInfoMore}>
                    Buy more <SvgSelector id="chevron-right-small" />
                </button> */}
            </div>
            <div className={s.progressBar}>
                <div className={s.progressBarLine} style={{ width: `${100 - percentageUsed}%`, background: userLoading ? 'transparent' : backgroundStyle }}></div>
            </div>
        </div>
    )
}
