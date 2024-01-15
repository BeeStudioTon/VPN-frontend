/* eslint-disable no-nested-ternary */
import { FC } from 'react'
import ContentLoader from 'react-content-loader'

interface SkeletonInfoProps {
    isTg: boolean;
    widthFull?: boolean;
    widthHalf?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
    height?: string
}

export const SkeletonInfo: FC<SkeletonInfoProps> = ({
    isTg,
    widthFull = false,
    widthHalf = false,
    backgroundColor,
    foregroundColor,
    height,
    ...rest
}) => {
    const widthValue = widthFull ? 110 : (widthHalf ? 85 : 40)

    return (
        <ContentLoader
            speed={2}
            width={widthValue}
            height={height ?? '18'}
            viewBox={`0 0 ${widthValue} ${height ?? '18'}`}
            backgroundColor={backgroundColor || (isTg ? 'var(--tg-theme-secondary-bg-color)' : '#3d3d3d')}
            foregroundColor={foregroundColor || (isTg ? 'var(--tg-theme-bg-color)' : '#545151')}
            {...rest}
        >
            <rect x="0" y="0" rx="10" ry="10" width="100%" height={height ?? '18'} />
        </ContentLoader>
    )
}
