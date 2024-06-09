/* eslint-disable max-len */
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
    <TonConnectUIProvider
        manifestUrl="https://manifests.delab.team/devpn.txt"
    >
        {children}
    </TonConnectUIProvider>
)
