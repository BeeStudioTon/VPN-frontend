/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TonConnectUIProvider } from 'delab-tonconnect-ui-react'
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
    <TonConnectUIProvider manifestUrl="https://72a879bd.manifests.pages.dev/devpn.txt"
        // actionsConfiguration={{
        //     // modals: [ 'before', 'success', 'error' ],
        //     // notifications: [ 'before', 'success', 'error' ],
        //     // skipRedirectToWallet: 'never', // 'ios' (default), or 'never', or 'always',
        //     returnStrategy: 'tg://'
        //     // twaReturnUrl: process.env.REACT_APP_RETURN_BOT_TWA_URL as `${string}://${string}`
        // }}
        walletsListConfiguration ={{
            includeWallets: [
                {
                    appName: 'dewallet',
                    name: 'DeWallet',
                    imageUrl: 'https://avatars.githubusercontent.com/u/116884789?s=200&v=4',
                    aboutUrl: 'https://wallet.tg/',
                    universalLink: 'https://t.me/delabtonbot/wallet?attach=wallet', // https://t.me/delabtonbot/wallet 'https://v2.delabwallet.com/tonconnect' https://t.me/wallet?attach=wallet,
                    bridgeUrl: 'https://bridge.tonapi.io/bridge',
                    platforms: [ 'ios', 'android', 'macos', 'windows', 'linux' ]
                }
            ]
        } }
    >
        {children}
    </TonConnectUIProvider>
)
