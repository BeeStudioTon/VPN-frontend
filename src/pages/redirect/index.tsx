import { FC, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface RedirectProps {}

export const Redirect: FC<RedirectProps> = () => {
    const location = useLocation()

    const urlSearch = useMemo(() => new URLSearchParams(location.search), [ location.search ])
    console.log('🚀 ~ urlSearch:', urlSearch)

    useEffect(() => {
        const decodedUrl = urlSearch.get('key')

        if (!decodedUrl) {
            alert('Invalid URL: ' + decodedUrl)
            return
        }

        const decodeURI = decodeURIComponent(decodedUrl)
        // alert(decodeURI)

        const iframe: HTMLIFrameElement = document.createElement('iframe')
        iframe.style.display = 'none'

        document.body.appendChild(iframe)

        iframe.contentWindow?.location.replace(decodeURI)
    }, [ urlSearch ])

    return (
        <>
        </>
    )
}
