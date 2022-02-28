import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index.page';
import { VegaWalletContext } from '@vegaprotocol/react-helpers';

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
        }}
      >
        <Index />
      </VegaWalletContext.Provider>
    );
    expect(baseElement).toBeTruthy();
  });
});
