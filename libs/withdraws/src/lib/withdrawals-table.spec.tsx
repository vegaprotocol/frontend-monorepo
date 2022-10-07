import { MockedProvider } from '@apollo/client/testing';
import { act, render, screen } from '@testing-library/react';
import { getTimeFormat } from '@vegaprotocol/react-helpers';
import { WithdrawalStatus } from '@vegaprotocol/types';
import type { TypedDataAgGrid } from '@vegaprotocol/ui-toolkit';
import { generateWithdrawal } from './test-helpers';
import { StatusCell } from './withdrawals-table';
import { WithdrawalsTable } from './withdrawals-table';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ provider: undefined }),
}));

const generateJsx = (props: TypedDataAgGrid<WithdrawalFields>) => (
  <MockedProvider>
    <WithdrawalsTable {...props} />
  </MockedProvider>
);

describe('renders the correct columns', () => {
  it('incomplete withdrawal', async () => {
    const withdrawal = generateWithdrawal();
    await act(async () => {
      render(generateJsx({ rowData: [withdrawal] }));
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Asset',
      'Amount',
      'Recipient',
      'Completed',
      'Status',
      'Transaction',
    ]);

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      'asset-symbol',
      '1.00',
      '123456…123456',
      '-',
      'Pending',
      '-',
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });

  it('completed withdrawal', async () => {
    const withdrawal = generateWithdrawal({
      txHash: '0x1234567891011121314',
      withdrawnTimestamp: '2022-04-21T00:00:00',
      status: WithdrawalStatus.STATUS_FINALIZED,
    });

    await act(async () => {
      render(generateJsx({ rowData: [withdrawal] }));
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      'asset-symbol',
      '1.00',
      '123456…123456',
      getTimeFormat().format(new Date(withdrawal.withdrawnTimestamp as string)),
      'Completed',
      '0x1234…121314',
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });
});

describe('StatusCell', () => {
  let props: { data: WithdrawalFields };
  let withdrawal: WithdrawalFields;

  beforeEach(() => {
    withdrawal = generateWithdrawal();
    props = {
      data: withdrawal,
    };
  });

  it('Open', () => {
    props.data.pendingOnForeignChain = false;
    props.data.txHash = null;
    render(<StatusCell {...props} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('Pending', () => {
    props.data.pendingOnForeignChain = true;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('Completed', () => {
    props.data.pendingOnForeignChain = false;
    props.data.txHash = '0x123';
    props.data.status = WithdrawalStatus.STATUS_FINALIZED;
    render(<StatusCell {...props} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('Rejected', () => {
    props.data.pendingOnForeignChain = false;
    props.data.txHash = '0x123';
    props.data.status = WithdrawalStatus.STATUS_REJECTED;
    render(<StatusCell {...props} />);

    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
