import { render, screen } from '@testing-library/react';

import { useAssetsStore } from '@/stores/assets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { Withdraw } from './withdrawal';

jest.mock('./basic-withdrawal', () => ({
  BasicWithdrawal: () => <div data-testid="basic-withdrawal" />,
}));

jest.mock('./enriched-withdrawal', () => ({
  EnrichedWithdrawal: () => <div data-testid="enriched-withdrawal" />,
}));

jest.mock('./receiving-key', () => ({
  ReceivingKey: () => <div data-testid="receiving-key" />,
}));

jest.mock('@/stores/assets-store');

describe('Withdrawal', () => {
  it('renders nothing if withdrawal is not of type erc20', () => {
    mockStore(useAssetsStore, {
      loading: true,
    });
    const { container } = render(
      <Withdraw
        transaction={{
          withdrawSubmission: {},
        }}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('renders basic withdrawal view if loading', () => {
    mockStore(useAssetsStore, {
      loading: true,
    });
    render(
      <Withdraw
        transaction={{
          withdrawSubmission: {
            amount: '2'.repeat(18),
            assetId: '1'.repeat(64),
            ext: {
              erc20: { address: '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e' },
            },
          },
        }}
      />
    );

    expect(screen.getByTestId('basic-withdrawal')).toBeInTheDocument();
  });
  it('renders enriched withdrawal view if loading was successful', () => {
    mockStore(useAssetsStore, {
      loading: false,
    });
    render(
      <Withdraw
        transaction={{
          withdrawSubmission: {
            amount: '2'.repeat(18),
            assetId: '1'.repeat(64),
            ext: {
              erc20: { address: '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e' },
            },
          },
        }}
      />
    );
    expect(screen.getByTestId('enriched-withdrawal')).toBeInTheDocument();
  });
});
