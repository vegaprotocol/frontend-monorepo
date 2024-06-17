import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AccountsActionsDropdown } from './accounts-actions-dropdown';
import userEvent from '@testing-library/user-event';

describe('AccountsActionsDropdown', () => {
  let onClickDeposit: jest.Mock;
  let onClickWithdraw: jest.Mock;
  let onClickTransfer: jest.Mock;
  let onClickSwap: jest.Mock;

  beforeEach(() => {
    onClickDeposit = jest.fn();
    onClickWithdraw = jest.fn();
    onClickTransfer = jest.fn();
    onClickSwap = jest.fn();
  });

  it('should render dropdown items correctly', async () => {
    // 7001-COLL-005
    // 7001-COLL-006
    // 1003-TRAN-001
    render(
      <AccountsActionsDropdown
        assetId="testAssetId"
        assetContractAddress="testAssetContractAddress"
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickTransfer={onClickTransfer}
        onClickSwap={onClickSwap}
      />
    );

    await userEvent.click(screen.getByTestId('icon-kebab'));

    expect(screen.getByTestId('deposit')).toHaveTextContent('Deposit');
    expect(screen.getByTestId('withdraw')).toHaveTextContent('Withdraw');
    expect(screen.getByTestId('transfer')).toHaveTextContent('Transfer');
    expect(screen.getByText('View asset details')).toBeInTheDocument();
    expect(screen.getByText('Copy asset ID')).toBeInTheDocument();
    expect(screen.getByText('View on Etherscan')).toBeInTheDocument();
  });

  it('should call callback functions on click', async () => {
    render(
      <AccountsActionsDropdown
        assetId="testAssetId"
        assetContractAddress="testAssetContractAddress"
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickTransfer={onClickTransfer}
        onClickSwap={onClickSwap}
      />
    );

    await userEvent.click(screen.getByTestId('icon-kebab'));
    await userEvent.click(screen.getByTestId('deposit'));
    expect(onClickDeposit).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTestId('icon-kebab'));
    await userEvent.click(screen.getByTestId('withdraw'));
    expect(onClickWithdraw).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTestId('icon-kebab'));
    await userEvent.click(screen.getByTestId('transfer'));
    expect(onClickTransfer).toHaveBeenCalledTimes(1);
  });
});
