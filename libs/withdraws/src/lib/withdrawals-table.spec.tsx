import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { formatNumber, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { WithdrawalStatus } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type {
  StatusCellProps,
  WithdrawalsTableProps,
} from './withdrawals-table';
import { StatusCell } from './withdrawals-table';
import { WithdrawalsTable } from './withdrawals-table';
import type { Withdrawals_party_withdrawals } from './__generated__/Withdrawals';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ provider: undefined }),
}));

const props = {
  withdrawals: [generateWithdrawal()],
};

const generateJsx = (props: WithdrawalsTableProps) => (
  <MockedProvider>
    <WithdrawalsTable {...props} />
  </MockedProvider>
);

test('Renders the correct columns', async () => {
  const withdrawal = generateWithdrawal();
  await act(async () => {
    render(generateJsx({ withdrawals: [withdrawal] }));
  });

  const headers = screen.getAllByRole('columnheader');
  expect(headers).toHaveLength(5);
  expect(headers.map((h) => h.textContent?.trim())).toEqual([
    'Asset',
    'Amount',
    'Recipient',
    'Created at',
    'Status',
  ]);

  const cells = screen.getAllByRole('gridcell');
  const expectedValues = [
    'asset-symbol',
    formatNumber(withdrawal.amount, withdrawal.asset.decimals),
    '123456\u2026123456',
    getDateTimeFormat().format(new Date(withdrawal.createdTimestamp)),
    withdrawal.status,
  ];
  cells.forEach((cell, i) => {
    expect(cell).toHaveTextContent(expectedValues[i]);
  });
});

describe('StatusCell', () => {
  let props: StatusCellProps;
  let withdrawal: Withdrawals_party_withdrawals;
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

  test('Open', () => {
    props.value = WithdrawalStatus.Finalized;
    props.data.pendingOnForeignChain = false;
    props.data.txHash = null;
    render(<StatusCell {...props} />);

    screen.debug();
    expect(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Complete', { selector: 'button' }));
    expect(mockComplete).toHaveBeenCalled();
  });

  test('Pending', () => {
    props.value = WithdrawalStatus.Finalized;
    props.data.pendingOnForeignChain = true;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Pending'));
    expect(screen.getByText('View on Etherscan')).toHaveAttribute(
      'href',
      expect.stringContaining(props.data.txHash)
    );
  });

  test('Finalized', () => {
    props.value = WithdrawalStatus.Finalized;
    props.data.pendingOnForeignChain = false;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Finalized'));
    expect(screen.getByText('View on Etherscan')).toHaveAttribute(
      'href',
      expect.stringContaining(props.data.txHash)
    );
  });

  test('Fallback', () => {
    props.value = WithdrawalStatus.Rejected;
    props.data.pendingOnForeignChain = false;
    props.data.txHash = '0x123';
    render(<StatusCell {...props} />);

    expect(screen.getByText('Rejected'));
  });
});

function generateWithdrawal(
  override?: PartialDeep<Withdrawals_party_withdrawals>
): Withdrawals_party_withdrawals {
  return merge(
    {
      __typename: 'Withdrawal',
      id: 'withdrawal-id',
      status: WithdrawalStatus.Open,
      amount: '100',
      asset: {
        __typename: 'Asset',
        id: 'asset-id',
        symbol: 'asset-symbol',
        decimals: 2,
      },
      createdTimestamp: '2022-04-20T00:00:00',
      withdrawnTimestamp: null,
      txHash: null,
      details: {
        __typename: 'Erc20WithdrawalDetails',
        receiverAddress: '123456___123456',
      },
      pendingOnForeignChain: false,
    },
    override
  );
}
