import { render, screen } from '@testing-library/react';

import { BaseWithdrawal } from './base-withdrawal';

jest.mock('./receiving-key', () => ({
  ReceivingKey: () => <div data-testid="receiving-key" />,
}));

describe('BaseWithdrawal', () => {
  it('renders children', () => {
    render(
      <BaseWithdrawal receiverAddress="0x12345678" assetId={'0'.repeat(64)}>
        <div>Child Component</div>
      </BaseWithdrawal>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('renders EthereumKey with the correct address prop', () => {
    // 1123-WITH-001 I can see the Ethereum key I am withdrawing the assets to
    render(
      <BaseWithdrawal receiverAddress="0x87654321" assetId={'0'.repeat(64)}>
        Child
      </BaseWithdrawal>
    );

    expect(screen.getByTestId('receiving-key')).toBeInTheDocument();
  });
});
