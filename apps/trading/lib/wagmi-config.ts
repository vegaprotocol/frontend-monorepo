import { http, createConfig } from 'wagmi';
import * as chains from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';
import { ENV, Networks } from '@vegaprotocol/environment';

import { TRANSPORTS } from '@vegaprotocol/web3';
import { type HttpTransport } from 'viem';

const allChains = Object.values(chains);

const transports = allChains.reduce((obj, c) => {
  obj[c.id] = http();
  return obj;
}, {} as Record<number, HttpTransport>);

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains:
      // Provide mainnet chains if on mainnet only
      ENV.VEGA_ENV === Networks.MAINNET
        ? allChains
        : [chains.sepolia, chains.arbitrumSepolia],
    transports: {
      ...transports,
      [chains.mainnet.id]: http(TRANSPORTS[chains.mainnet.id]),
      [chains.sepolia.id]: http(TRANSPORTS[chains.sepolia.id]),
      [chains.arbitrum.id]: http(TRANSPORTS[chains.arbitrum.id]),
      [chains.arbitrumSepolia.id]: http(TRANSPORTS[chains.arbitrumSepolia.id]),
    },
    walletConnectProjectId: process.env.NX_WALLETCONNECT_PROJECT_ID as string,
    appName: 'Vega',
    appDescription: 'Vega deposits and withdrawals',
  })
);
