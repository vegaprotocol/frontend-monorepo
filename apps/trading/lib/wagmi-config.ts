import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';
import { ENV, Networks } from '@vegaprotocol/environment';

import { TRANSPORTS } from '@vegaprotocol/web3';

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains:
      // Provide mainnet chains if on mainnet only
      ENV.VEGA_ENV === Networks.MAINNET
        ? [mainnet, arbitrum]
        : [sepolia, arbitrumSepolia],
    transports: {
      [mainnet.id]: http(TRANSPORTS[mainnet.id]),
      [sepolia.id]: http(TRANSPORTS[sepolia.id]),
      [arbitrum.id]: http(TRANSPORTS[arbitrum.id]),
      [arbitrumSepolia.id]: http(TRANSPORTS[arbitrumSepolia.id]),
    },
    walletConnectProjectId: process.env.NX_WALLETCONNECT_PROJECT_ID as string,
    appName: 'Vega',
    appDescription: 'Vega deposits and withdrawals',
  })
);
