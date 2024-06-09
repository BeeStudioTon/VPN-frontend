/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TonConnectUIProvider } from 'delab-tonconnect-ui-react';
import { WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

import { FC, ReactNode } from 'react';

type UIWallet = WalletInfoBase &
    (Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote);

type WalletsListConfiguration = {
    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];
};

interface TonConnectProviderProps {
    children: ReactNode;
}

export const TonConnectProvider: FC<TonConnectProviderProps> = ({ children }) => (
    <TonConnectUIProvider
        manifestUrl="https://manifests.delab.team/devpn.txt"
        walletsListConfiguration={{
            includeWallets: [
                {
                    appName: 'dewallet',
                    name: 'DeWallet',
                    imageUrl: 'https://de-cdn.delab.team/icons/DeLabLogo.png',
                    aboutUrl: 'https://wallet.tg/',
                    universalLink: 'https://t.me/delabtonbot/wallet?attach=wallet', // https://t.me/delabtonbot/wallet 'https://v2.delabwallet.com/tonconnect' https://t.me/wallet?attach=wallet,
                    bridgeUrl: 'https://sse-bridge.delab.team/bridge',
                    platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
                },
            ],
        }}
    >
        {children}
    </TonConnectUIProvider>
);
