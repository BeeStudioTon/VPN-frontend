export function openTelegramLink (key: string): void {
    const isWindows: boolean = navigator.platform.toUpperCase().indexOf('WIN') >= 0

    if (isWindows) {
        const iframe: HTMLIFrameElement = document.createElement('iframe')
        iframe.style.display = 'none'

        document.body.appendChild(iframe)

        iframe.contentWindow?.location.replace(key)
    } else {
        const link = document.createElement('a')
        link.href = key
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
