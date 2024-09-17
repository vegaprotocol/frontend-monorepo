import { createElement, type PropsWithChildren } from 'react';
import {
  createConfig,
  mockChain,
  MockConnector,
  type Wallet,
} from '@vegaprotocol/wallet';
import { WalletContext } from './context';

const mockConnector = new MockConnector();

export const mockConfig = createConfig({
  chains: [mockChain],
  defaultChainId: mockChain.id,
  connectors: [mockConnector],
  appName: 'Vega',
});

export function MockedWalletProvider({
  children,
  config,
}: PropsWithChildren<{ config?: Wallet }>) {
  return createElement(
    WalletContext.Provider,
    {
      value: config ? config : mockConfig,
    },
    children
  );
}
