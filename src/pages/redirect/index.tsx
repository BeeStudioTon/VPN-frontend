import { FC, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface RedirectProps {}

export const Redirect: FC<RedirectProps> = () => {
    const location = useLocation()

    const urlSearch = useMemo(() => new URLSearchParams(location.search), [ location.search ])

    useEffect(() => {
        const decodedUrl = urlSearch.get('key')

        if (!decodedUrl) {
            alert('Invalid URL: ' + decodedUrl)
            return
        }

        try {
            const decodedURI = decodeURIComponent(decodedUrl)

            const iframe: HTMLIFrameElement = document.createElement('iframe')
            iframe.style.display = 'none'

            document.body.appendChild(iframe)

            iframe.contentWindow?.location.replace(decodedURI)
        } catch (error) {
            console.error('Error decoding URL:', error)
            alert('Error decoding URL: ' + error)
        }
    }, [ urlSearch ])

    return (
        <>
        </>
    )
}
