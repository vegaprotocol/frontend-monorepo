import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index.page';
import { VegaWalletContext } from '@vegaprotocol/wallet';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VegaWalletContext.Provider
        value={{
          keypair: null,
          keypairs: null,
          connect: jest.fn(),
          disconnect: jest.fn(),
          selectPublicKey: jest.fn(),
          connector: null,
          sendTx: jest.fn(),
        }}
      >
        <Index />
      </VegaWalletContext.Provider>
    );
    expect(baseElement).toBeTruthy();
  });
});
