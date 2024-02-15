import { render, screen } from '@testing-library/react';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react';
import { type Store } from '@vegaprotocol/wallet';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalFormSubmit } from './proposal-form-submit';

const renderComponent = (isSubmitting: boolean, store?: Partial<Store>) => {
  render(
    <MockedWalletProvider store={store}>
      <AppStateProvider>
        <ProposalFormSubmit isSubmitting={isSubmitting} />
      </AppStateProvider>
    </MockedWalletProvider>
  );
};

describe('Proposal Form Submit', () => {
  const pubKey = { publicKey: '123456__123456', name: 'test' };

  it('should display connection message and button if wallet not connected', () => {
    renderComponent(false);

    expect(
      screen.getByText('Connect your wallet to submit a proposal')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('connect-to-vega-wallet-btn')
    ).toBeInTheDocument();
  });

  it('should display submit button if wallet is connected', () => {
    renderComponent(false, {
      pubKey: pubKey.publicKey,
      keys: [pubKey],
    });
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submit proposal'
    );
  });

  it('should display submitting button text if wallet is connected and submitting', () => {
    renderComponent(true, {
      pubKey: pubKey.publicKey,
      keys: [pubKey],
    });
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submitting proposal'
    );
  });
});
