import { createElement, type PropsWithChildren } from 'react';
import { createConfig, mockChain, MockConnector } from '@vegaprotocol/wallet';
import { WalletContext } from './context';

const mockConnector = new MockConnector();

export const mockConfig = createConfig({
  chains: [mockChain],
  defaultChainId: mockChain.id,
  connectors: [mockConnector],
});

export function MockedWalletProvider({ children }: PropsWithChildren) {
  return createElement(
    WalletContext.Provider,
    {
      value: mockConfig,
    },
    children
  );
}
