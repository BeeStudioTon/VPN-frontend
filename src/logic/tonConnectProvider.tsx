/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk'

import { FC, ReactNode } from 'react'

type UIWallet = WalletInfoBase &
(Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote)

type WalletsListConfiguration = {
    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];
}

interface TonConnectProviderProps {
    children: ReactNode;
}

export const TonConnectProvider: FC<TonConnectProviderProps> = ({ children }) => (
    <TonConnectUIProvider manifestUrl="https://gist.github.com/anovic123/877ea21972da920589c460075d9e6ddf.txt"
        // actionsConfiguration={{
        //     modals: [ 'before', 'success', 'error' ],
        //     notifications: [ 'before', 'success', 'error' ],
        //     skipRedirectToWallet: 'never', // 'ios' (default), or 'never', or 'always',
        //     returnStrategy: 'tg://'
        //     // twaReturnUrl: process.env.REACT_APP_RETURN_BOT_TWA_URL as `${string}://${string}`
        // }}
        walletsListConfiguration ={{
            includeWallets: [
                {
                    appName: 'dewallet',
                    name: 'DeWallet',
                    imageUrl: 'https://wallet.tg/images/logo-288.png',
                    aboutUrl: 'https://wallet.tg/',
                    universalLink: 'https://v2.delabwallet.com/tonconnect',
                    bridgeUrl: 'https://bridge.tonapi.io/bridge',
                    platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ]
                },
                {
                    appName: 'telegram-wallet',
                    name: 'Wallet',
                    imageUrl: 'https://wallet.tg/images/logo-288.png',
                    aboutUrl: 'https://wallet.tg/',
                    universalLink: 'https://t.me/wallet?attach=wallet',
                    bridgeUrl: 'https://bridge.tonapi.io/bridge',
                    platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ]
                },
                {
                    appName: 'tonkeeper',
                    name: 'Tonkeeper',
                    imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
                    tondns: 'tonkeeper.ton',
                    aboutUrl: 'https://tonkeeper.com',
                    universalLink: 'https://app.tonkeeper.com/ton-connect',
                    deepLink: 'tonkeeper-tc://',
                    bridgeUrl: 'https://bridge.tonapi.io/bridge',
                    platforms: [ 'ios', 'android', 'chrome', 'firefox', 'macos' ]
                }
            ]
        } }
    >
        {children}
    </TonConnectUIProvider>
)
