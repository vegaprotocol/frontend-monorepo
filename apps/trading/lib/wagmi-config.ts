import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, arbitrum, arbitrumSepolia],
    transports: {
      // TODO: add mainnet
      [sepolia.id]: http(process.env.NX_ETHEREUM_PROVIDER_URL),
      [arbitrum.id]: http(),
      [arbitrumSepolia.id]: http(),
    },
    walletConnectProjectId: process.env.NX_WALLETCONNECT_PROJECT_ID as string,
    appName: 'Vega',
    appDescription: 'Vega deposits and withdrawals',
  })
);
