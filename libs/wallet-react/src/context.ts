import {
  createContext,
  createElement,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { type Wallet } from '@vegaprotocol/wallet';
import { createWalletBackend } from '@vegaprotocol/browser-wallet-backend';

export const WalletContext = createContext<Wallet | undefined>(undefined);

export function WalletProvider({
  children,
  node,
  config,
}: PropsWithChildren<{ config: Wallet; node: string | undefined }>) {
  useEffect(() => {
    if (typeof window !== 'undefined' && node) {
      // TODO: This is creating the whole wallet backend every time the node changes
      // it is also creating the backend regardless of whether the embedded wallet is used
      // or not. This is not ideal, as we'd like this tree shaken out.

      // Consider where this makes the most sense, i.e. should this be in the ctor of the connector?
      // or should this be a config option?
      createWalletBackend({
        node: new URL(node),
      });
    }
  }, [node]);

  return createElement(WalletContext.Provider, { value: config }, children);
}
