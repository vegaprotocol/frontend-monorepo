import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { locators as amountWithTooltipLocators } from '../utils/string-amounts/amount-with-tooltip';
import {
  BasicTransferView,
  locators as basicLocators,
} from './basic-transfer-view';
import { AccountType } from '@vegaprotocol/enums';

const mockTransaction = {
  transfer: {
    amount: '10',
    asset: '0'.repeat(64),
    to: '1'.repeat(64),
    fromAccountType: AccountType.ACCOUNT_TYPE_BOND,
    toAccountType: AccountType.ACCOUNT_TYPE_BOND,
    reference: 'reference',
    kind: null,
  },
};

describe('BasicTransferView', () => {
  it('renders correctly', () => {
    render(
      <MockNetworkProvider>
        <BasicTransferView transaction={mockTransaction} />
      </MockNetworkProvider>
    );

    expect(screen.getByTestId(basicLocators.basicSection)).toBeInTheDocument();
    expect(
      screen.getByTestId(amountWithTooltipLocators.amountWithTooltip)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(amountWithTooltipLocators.amount)
    ).toHaveTextContent('10');
    expect(
      screen.getByTestId(amountWithTooltipLocators.assetExplorerLink)
    ).toHaveTextContent('000000…0000');
  });
});
