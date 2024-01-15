import { FC } from 'react'

import { SkeletonInfo } from '../../../../../components/skeleton-info'
import { SvgSelector } from '../../../../../assets/svg-selector'

import s from './method.module.scss'

interface MethodSkeletonProps {
    isTg: boolean
}

export const MethodSkeleton: FC<MethodSkeletonProps> = ({ isTg }) => (
    <li
        className={s.methodAsset}
    >
        <div className={s.methodAssetLeft}>
            <div className={`${s.methodAssetSelect}`}>
            </div>
            <div className={s.methodAssetLeftBody}>
                <div className={s.methodAssetLeftSkeleton} />
                <div>
                    <div className={s.methodAssetToken}><SkeletonInfo isTg={isTg} widthHalf /></div>
                    <span className={s.methodAssetAmount}><SkeletonInfo isTg={isTg} widthHalf /></span>
                </div>
            </div>
        </div>
        <div className={s.methodAssetRight}>
            <span><SkeletonInfo isTg={isTg} widthHalf /></span>
            <SvgSelector id="chevron-right" />
        </div>
    </li>
)
