import { render, screen } from '@testing-library/react';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalFormSubmit } from './proposal-form-submit';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';

const renderComponent = (
  context: VegaWalletContextShape,
  isSubmitting: boolean
) => {
  render(
    <AppStateProvider>
      <VegaWalletContext.Provider value={context}>
        <ProposalFormSubmit isSubmitting={isSubmitting} />
      </VegaWalletContext.Provider>
    </AppStateProvider>
  );
};

describe('Proposal Form Submit', () => {
  it('should display connection message and button if wallet not connected', () => {
    renderComponent({ pubKey: null } as VegaWalletContextShape, false);

    expect(
      screen.getByText('Connect your wallet to submit a proposal')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('connect-to-vega-wallet-btn')
    ).toBeInTheDocument();
  });

  it('should display submit button if wallet is connected', () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    renderComponent(
      {
        pubKey: pubKey.publicKey,
        pubKeys: [pubKey],
      } as VegaWalletContextShape,
      false
    );
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submit proposal'
    );
  });

  it('should display submitting button text if wallet is connected and submitting', () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    renderComponent(
      {
        pubKey: pubKey.publicKey,
        pubKeys: [pubKey],
      } as VegaWalletContextShape,
      true
    );
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submitting proposal'
    );
  });
});
