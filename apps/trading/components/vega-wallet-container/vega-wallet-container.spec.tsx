import { render, screen } from '@testing-library/react';
import { VegaWalletContainer } from './vega-wallet-container';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type { PartialDeep } from 'type-fest';

const generateJsx = (context: PartialDeep<VegaWalletContextShape>) => {
  return (
    <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
      <VegaWalletContainer>
        <div data-testid="child" />
      </VegaWalletContainer>
    </VegaWalletContext.Provider>
  );
};

describe('VegaWalletContainer', () => {
  it('doesnt render children if not connected', () => {
    render(generateJsx({ pubKey: null }));
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children if connected', () => {
    render(generateJsx({ pubKey: '0x123' }));
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
