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
            console.log(decodedUrl)
            const decodedURI = decodeURIComponent(decodedUrl).split('00000000')

            const iframe: HTMLIFrameElement = document.createElement('iframe')
            iframe.style.display = 'none'

            document.body.appendChild(iframe)

            iframe.contentWindow?.location.replace(decodedURI[0] + '#' + decodedURI[1])

            window.location.href = decodedURI[0] + '#' + decodedURI[1]
        } catch (error) {
            console.error('Error decoding URL:', error)
            alert('Error decoding URL: ' + error)
        }
    }, [ urlSearch ])

    return (
        <>
        <p>Redirect VPN...</p>
        </>
    )
}
