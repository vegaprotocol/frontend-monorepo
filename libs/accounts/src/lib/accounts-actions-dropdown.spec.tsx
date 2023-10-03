import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AccountsActionsDropdown } from './accounts-actions-dropdown';
import userEvent from '@testing-library/user-event';

describe('AccountsActionsDropdown', () => {
  let onClickDeposit: jest.Mock;
  let onClickWithdraw: jest.Mock;
  let onClickBreakdown: jest.Mock;
  let onClickTransfer: jest.Mock;

  beforeEach(() => {
    onClickDeposit = jest.fn();
    onClickWithdraw = jest.fn();
    onClickBreakdown = jest.fn();
    onClickTransfer = jest.fn();
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
        onClickBreakdown={onClickBreakdown}
        onClickTransfer={onClickTransfer}
      />
    );

    userEvent.click(screen.getByTestId('icon-kebab'));

    expect(await screen.findByTestId('deposit')).toHaveTextContent('Deposit');
    expect(await screen.findByTestId('withdraw')).toHaveTextContent('Withdraw');
    expect(await screen.findByTestId('transfer')).toHaveTextContent('Transfer');
    expect(await screen.findByTestId('breakdown')).toHaveTextContent(
      'View usage breakdown'
    );
    expect(await screen.findByText('View asset details')).toBeInTheDocument();
    expect(await screen.findByText('Copy asset ID')).toBeInTheDocument();
    expect(await screen.findByText('View on Etherscan')).toBeInTheDocument();
  });

  it('should call callback functions on click', async () => {
    render(
      <AccountsActionsDropdown
        assetId="testAssetId"
        assetContractAddress="testAssetContractAddress"
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickBreakdown={onClickBreakdown}
        onClickTransfer={onClickTransfer}
      />
    );

    userEvent.click(screen.getByTestId('icon-kebab'));
    fireEvent.click(await screen.findByTestId('deposit'));
    expect(onClickDeposit).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('icon-kebab'));
    fireEvent.click(await screen.findByTestId('withdraw'));
    expect(onClickWithdraw).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('icon-kebab'));
    fireEvent.click(await screen.findByTestId('transfer'));
    expect(onClickTransfer).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('icon-kebab'));
    fireEvent.click(await screen.findByTestId('breakdown'));
    expect(onClickBreakdown).toHaveBeenCalledTimes(1);
  });
});
