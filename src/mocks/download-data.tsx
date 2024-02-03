import IOS from '../assets/icons/categories/ios.svg'
import MACOS from '../assets/icons/categories/macOS.svg'
import WINDOWS from '../assets/icons/categories/windows.svg'
import LINUX from '../assets/icons/categories/linux.svg'
import ANDROID from '../assets/icons/categories/android.svg'

export const DownloadData = [
    {
        name: 'IOS',
        link: 'https://itunes.apple.com/app/outline-app/id1356177741',
        icon: <IOS />
    },
    {
        name: 'macOS',
        link: 'https://apps.apple.com/ru/app/outline-secure-internet-access/id1356178125?l=en-GB&mt=12',
        icon: <MACOS />
    },
    {
        name: 'Windows',
        link: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe',
        icon: <WINDOWS />
    },
    {
        name: 'Linux',
        link: 'https://s3.amazonaws.com/outline-releases/client/linux/stable/Outline-Client.AppImage',
        icon: <LINUX />
    },
    {
        name: 'Android',
        link: 'https://play.google.com/store/apps/details?id=org.outline.android.client',
        icon: <ANDROID />
    }
]
