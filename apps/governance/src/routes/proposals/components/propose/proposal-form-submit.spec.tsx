import { act, render, screen } from '@testing-library/react';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalFormSubmit } from './proposal-form-submit';

const renderComponent = (isSubmitting: boolean) => {
  render(
    <MockedWalletProvider>
      <AppStateProvider>
        <ProposalFormSubmit isSubmitting={isSubmitting} />
      </AppStateProvider>
    </MockedWalletProvider>
  );
};

describe('Proposal Form Submit', () => {
  const pubKey = { publicKey: '123456__123456', name: 'test' };

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

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
    mockConfig.store.setState({
      pubKey: pubKey.publicKey,
      keys: [pubKey],
    });
    renderComponent(false);
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submit proposal'
    );
  });

  it('should display submitting button text if wallet is connected and submitting', () => {
    mockConfig.store.setState({
      pubKey: pubKey.publicKey,
      keys: [pubKey],
    });
    renderComponent(true);
    expect(screen.getByTestId('proposal-submit')).toHaveTextContent(
      'Submitting proposal'
    );
  });
});
