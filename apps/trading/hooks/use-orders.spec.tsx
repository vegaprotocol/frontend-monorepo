import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import {
  VegaWalletContext,
  VegaWalletContextShape,
} from '@vegaprotocol/wallet';
import { ReactNode } from 'react';
import { useOrders } from './use-orders';

const defaultWalletContext = {
  keypair: null,
  keypairs: [],
  sendTx: jest.fn().mockReturnValue(Promise.resolve(null)),
  connect: jest.fn(),
  disconnect: jest.fn(),
  selectPublicKey: jest.fn(),
  connector: null,
};

function setup(
  context?: Partial<VegaWalletContextShape>,
  marketId = 'market-id'
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider>
      <VegaWalletContext.Provider
        value={{ ...defaultWalletContext, ...context }}
      >
        {children}
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
  return renderHook(() => useOrders(), { wrapper });
}
