import { render, screen } from '@testing-library/react';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalFormSubmit } from './proposal-form-submit';
import * as walletHooks from '@vegaprotocol/wallet-react';

jest.mock('@vegaprotocol/wallet-react');

// @ts-ignore type wrong after mock
walletHooks.useDialogStore.mockReturnValue(jest.fn());

const renderComponent = (isSubmitting: boolean) => {
  render(
    <AppStateProvider>
      <ProposalFormSubmit isSubmitting={isSubmitting} />
    </AppStateProvider>
  );
};

describe('Proposal Form Submit', () => {
  it('should display connection message and button if wallet not connected', () => {
    // @ts-ignore type wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      status: 'disconnected',
      pubKey: undefined,
    });
    renderComponent(false);

    expect(
      screen.getByText('Connect your wallet to submit a proposal')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('connect-to-vega-wallet-btn')
    ).toBeInTheDocument();
  });

  it('should display submit button if wallet is connected', () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };

    // @ts-ignore types wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: pubKey.publicKey,
      pubKeys: [pubKey],
    });
    renderComponent(false);
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submit proposal'
    );
  });

  it('should display submitting button text if wallet is connected and submitting', () => {
    const pubKey = { publicKey: '123456__123456', name: 'test' };
    // @ts-ignore types wrong after mock
    walletHooks.useVegaWallet.mockReturnValue({
      pubKey: pubKey.publicKey,
      pubKeys: [pubKey],
    });
    renderComponent(true);
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submitting proposal'
    );
  });
});
