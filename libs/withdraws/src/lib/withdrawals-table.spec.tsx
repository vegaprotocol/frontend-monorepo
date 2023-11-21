import { MockedProvider } from '@apollo/client/testing';
import { act, render, screen } from '@testing-library/react';
import { getTimeFormat } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import { generateWithdrawal } from './test-helpers';
import { StatusCell } from './withdrawals-table';
import { WithdrawalsTable } from './withdrawals-table';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ provider: undefined }),
}));

const generateJsx = (props: TypedDataAgGrid<WithdrawalFieldsFragment>) => (
  <MockedProvider>
    <WithdrawalsTable {...props} />
  </MockedProvider>
);

describe('Withdrawals', () => {
  describe('renders the correct columns', () => {
    it('incomplete withdrawal', async () => {
      const withdrawal = generateWithdrawal();
      await act(async () => {
        render(generateJsx({ rowData: [withdrawal] }));
      });

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7);
      expect(headers.map((h) => h.textContent?.trim())).toEqual([
        'Asset',
        'Amount',
        'Recipient',
        'Created',
        'Completed',
        'Status',
        'Transaction',
      ]);

      const cells = screen.getAllByRole('gridcell');
      const expectedValues = [
        'asset-symbol',
        '1',
        '123456…123456',
        getTimeFormat().format(new Date(withdrawal.createdTimestamp as string)),
        '-',
        'Pending',
        'Complete withdrawal',
      ];
      cells.forEach((cell, i) => {
        expect(cell).toHaveTextContent(expectedValues[i]);
      });
    });

    it('completed withdrawal', async () => {
      const withdrawal = generateWithdrawal({
        txHash: '0x1234567891011121314',
        withdrawnTimestamp: '2022-04-21T00:00:00',
        status: Schema.WithdrawalStatus.STATUS_FINALIZED,
      });

      await act(async () => {
        render(generateJsx({ rowData: [withdrawal] }));
      });

      const cells = screen.getAllByRole('gridcell');
      const expectedValues = [
        'asset-symbol',
        '1',
        '123456…123456',
        getTimeFormat().format(new Date(withdrawal.createdTimestamp as string)),
        getTimeFormat().format(
          new Date(withdrawal.withdrawnTimestamp as string)
        ),
        'Completed',
        '0x1234…121314',
      ];
      cells.forEach((cell, i) => {
        expect(cell).toHaveTextContent(expectedValues[i]);
      });
    });
  });

  describe('StatusCell', () => {
    let props: { data: WithdrawalFieldsFragment };
    let withdrawal: WithdrawalFieldsFragment;

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
      props.data.status = Schema.WithdrawalStatus.STATUS_FINALIZED;
      render(<StatusCell {...props} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('Rejected', () => {
      props.data.pendingOnForeignChain = false;
      props.data.txHash = '0x123';
      props.data.status = Schema.WithdrawalStatus.STATUS_REJECTED;
      render(<StatusCell {...props} />);

      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });
});
