import { useEnvironment } from '@vegaprotocol/environment';
import { useWallet } from '@vegaprotocol/wallet-react';
import dynamic from 'next/dynamic';

export const BrowserWallet = dynamic(
  () =>
    import('@vegaprotocol/browser-wallet').then(({ BrowserWallet }) => {
      return function BrowserWalletWrapper() {
        const state = useEnvironment();
        const vegaChainId = useWallet((store) => store.chainId);
        return (
          <BrowserWallet
            explorer={state.VEGA_EXPLORER_URL ?? ''}
            docs={state.VEGA_DOCS_URL ?? ''}
            governance={state.VEGA_TOKEN_URL ?? ''}
            console={state.VEGA_CONSOLE_URL ?? ''}
            chainId={vegaChainId}
            etherscanUrl={state.ETHERSCAN_URL ?? ''}
          />
        );
      };
    }),
  {
    ssr: false,
  }
);
