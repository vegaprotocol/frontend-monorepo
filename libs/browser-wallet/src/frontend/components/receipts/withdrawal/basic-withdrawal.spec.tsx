import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { BasicWithdrawal } from './basic-withdrawal';

jest.mock('../utils/string-amounts/amount-with-tooltip', () => ({
  AmountWithTooltip: () => <div data-testid="amount-with-tooltip" />,
}));

describe('BasicWithdrawal', () => {
  it('renders AmountWithTooltip with the correct amount and asset props', () => {
    // 1123-WITH-002 I can see a the [amount being withdrawn with tooltip](./1127-DECM-decimal_numbers.md)
    // 1123-WITH-002 I can see a the a truncated asset id of the amount being withdrawn with link to the block explorer
    render(
      <MockNetworkProvider>
        <BasicWithdrawal
          receiverAddress="0x12345678"
          amount="10"
          assetId="ETH"
        />
      </MockNetworkProvider>
    );

    expect(screen.getByTestId('amount-with-tooltip')).toBeInTheDocument();
  });
});
