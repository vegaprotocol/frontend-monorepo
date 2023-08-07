import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { GetStarted } from './get-started';
import { render, screen } from '@testing-library/react';

describe('GetStarted', () => {
  const renderComponent = (context: Partial<VegaWalletContextShape> = {}) => {
    return render(
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <GetStarted />
      </VegaWalletContext.Provider>
    );
  };

  it('renders full get started content if not connected and no browser wallet detected', () => {
    renderComponent();
    expect(screen.getByTestId('get-started-banner')).toBeInTheDocument();
  });

  it('renders connect prompt if no pubKey but wallet installed', () => {
    globalThis.window.vega = {} as Vega;
    renderComponent();
    expect(screen.getByTestId('order-connect-wallet')).toBeInTheDocument();
    globalThis.window.vega = undefined as unknown as Vega;
  });

  it('renders nothing if connected', () => {
    const { container } = renderComponent({ pubKey: 'my-pubkey' });
    expect(container).toBeEmptyDOMElement();
  });
});
