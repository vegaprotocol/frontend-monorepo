import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import { WithdrawalStatus, WithdrawalStatusMapping } from '@vegaprotocol/types';
import { generateWithdrawal } from './test-helpers';
import type {
  StatusCellProps,
  WithdrawalsTableProps,
} from './withdrawals-table';
import { StatusCell } from './withdrawals-table';
import { WithdrawalsTable } from './withdrawals-table';
import type { Withdrawals_party_withdrawalsConnection_edges_node } from './__generated__/Withdrawals';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ provider: undefined }),
}));

const generateJsx = (props: WithdrawalsTableProps) => (
  <MockedProvider>
    <WithdrawalsTable {...props} />
  </MockedProvider>
);

describe('renders the correct columns', () => {
  it('incomplete withdrawal', async () => {
    const withdrawal = generateWithdrawal();
    await act(async () => {
      render(generateJsx({ withdrawals: [withdrawal] }));
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Asset',
      'Amount',
      'Recipient',
      'Created at',
      'TX hash',
      'Status',
    ]);

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      'asset-symbol',
      addDecimalsFormatNumber(withdrawal.amount, withdrawal.asset.decimals),
      '123456\u2026123456',
      getDateTimeFormat().format(new Date(withdrawal.createdTimestamp)),
      '-',
      WithdrawalStatusMapping[withdrawal.status],
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });

  it('completed withdrawal', async () => {
    const withdrawal = generateWithdrawal({
      txHash: '0x1234567891011121314',
      status: WithdrawalStatus.STATUS_FINALIZED,
    });

    await act(async () => {
      render(generateJsx({ withdrawals: [withdrawal] }));
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      'asset-symbol',
      addDecimalsFormatNumber(withdrawal.amount, withdrawal.asset.decimals),
      '123456…123456',
      getDateTimeFormat().format(new Date(withdrawal.createdTimestamp)),
      '0x1234…121314',
      WithdrawalStatusMapping[withdrawal.status],
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });
});

describe('StatusCell', () => {
  let props: StatusCellProps;
  let withdrawal: Withdrawals_party_withdrawalsConnection_edges_node;
  let mockComplete: jest.Mock;

  beforeEach(() => {
    withdrawal = generateWithdrawal();
    mockComplete = jest.fn();
    // @ts-ignore dont need full ICellRendererParams
    props = {
      value: withdrawal.status,
      data: withdrawal,
      complete: mockComplete,
    };
  });

  it('Open', () => {
    props.value = WithdrawalStatus.STATUS_FINALIZED;
    props.data.pendingOnForeignChain = false;
    props.data.txHash = null;
    render(<StatusCell {...props} />);

    expect(screen.getByText('Open')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Complete', { selector: 'button' }));
    expect(mockComplete).toHaveBeenCalled();
  });

  it('Pending', () => {
    props.value = WithdrawalStatus.STATUS_FINALIZED;
    props.data.pendingOnForeignChain = true;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('View on Etherscan')).toHaveAttribute(
      'href',
      expect.stringContaining(props.data.txHash)
    );
  });

  it('Finalized', () => {
    props.value = WithdrawalStatus.STATUS_FINALIZED;
    props.data.pendingOnForeignChain = false;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Finalized')).toBeInTheDocument();
  });
});
