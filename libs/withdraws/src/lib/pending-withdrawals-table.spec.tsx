import { MockedProvider } from '@apollo/client/testing';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateWithdrawal } from './test-helpers';
import type { PendingWithdrawalsTableProps } from './pending-withdrawals-table';
import { CompleteCell } from './pending-withdrawals-table';
import { PendingWithdrawalsTable } from './pending-withdrawals-table';
import { getTimeFormat } from '@vegaprotocol/react-helpers';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({ provider: undefined }),
}));

const generateTable = (props: PendingWithdrawalsTableProps) => (
  <MockedProvider>
    <PendingWithdrawalsTable {...props} />
  </MockedProvider>
);

describe('PendingWithdrawalsTable', () => {
  it('displays correct columns', async () => {
    const withdrawal = generateWithdrawal();
    await act(async () => {
      render(generateTable({ withdrawals: [withdrawal] }));
    });
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Asset',
      'Amount',
      'Recipient',
      'Created',
      '',
    ]);
  });
  it('displays given withdrawals', async () => {
    const withdrawal = generateWithdrawal();
    await act(async () => {
      render(generateTable({ withdrawals: [withdrawal] }));
    });
    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      'asset-symbol',
      '1.00',
      '123456…123456',
      getTimeFormat().format(new Date(withdrawal.createdTimestamp)),
      'Complete withdrawal',
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });
});

describe('CompleteCell', () => {
  const mockComplete = jest.fn();
  const data = generateWithdrawal();
  it('opens the dialog', () => {
    render(<CompleteCell complete={mockComplete} data={data} />);
    fireEvent.click(
      screen.getByText('Complete withdrawal', { selector: 'button' })
    );
    expect(mockComplete).toBeCalled();
  });
});
