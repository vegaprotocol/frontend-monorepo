import { http, createConfig } from 'wagmi';
import * as chains from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

import { TRANSPORTS } from '@vegaprotocol/web3';
import { type HttpTransport } from 'viem';

// Create an array of all available chains with arbitrum and
// normal ethereum mainnet first. These will be the default chains
const allChains = [
  chains.mainnet,
  chains.arbitrum,
  ...Object.values(chains).filter((c) => {
    if (c.id === chains.arbitrum.id) return false;
    if (c.id === chains.mainnet.id) return false;
    return true;
  }),
];

const transports = allChains.reduce((obj, c) => {
  obj[c.id] = http();
  return obj;
}, {} as Record<number, HttpTransport>);

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // @ts-expect-error not all chains in allChains conform to the chain interface
    chains: allChains,
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
