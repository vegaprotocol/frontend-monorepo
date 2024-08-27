import { render, screen } from '@testing-library/react';

import { TransactionState } from '@/types/backend';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GroupedTransactionList, locators } from './grouped-transactions-list';
import { type TransactionsListProperties } from './transactions-list';

jest.mock('./transactions-list', () => ({
  TransactionsList: ({ transactions }: TransactionsListProperties) => (
    <div data-testid="transactions-list">
      {transactions.map((t) => (
        <div key={t.id} data-testid="transactions-list-item">
          {t.id}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('./transactions-list-empty', () => ({
  TransactionListEmpty: () => <div data-testid="empty" />,
}));

describe('GroupedTransactionsList', () => {
  it('renders empty state if there are not transactions', () => {
    // 1148-TXLS-002 When I have no transactions I am presented with a message informing me so
    render(<GroupedTransactionList transactions={[]} />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
  it('groups all transactions by date', () => {
    render(
      <GroupedTransactionList
        transactions={[
          {
            publicKey: '0'.repeat(64),
            id: '1',
            transaction: { transfer: {} },
            sendingMode: 'SYNC',
            keyName: 'Key 1',
            walletName: 'Wallet 1',
            origin: 'https://foo.com',
            receivedAt: new Date(0).toISOString(),
            networkId: '1',
            chainId: '2',
            decision: new Date(0).toISOString(),
            state: TransactionState.Confirmed,
            node: 'https://node.com',
            autoApproved: false,
            error: undefined,
            hash: undefined,
            code: undefined,
          },
          {
            publicKey: '0'.repeat(64),
            id: '2',
            transaction: { transfer: {} },
            sendingMode: 'SYNC',
            keyName: 'Key 1',
            walletName: 'Wallet 1',
            origin: 'https://foo.com',
            receivedAt: new Date(1).toISOString(),
            networkId: '1',
            chainId: '2',
            decision: new Date(1).toISOString(),
            state: TransactionState.Confirmed,
            node: 'https://node.com',
            autoApproved: false,
            error: undefined,
            hash: undefined,
            code: undefined,
          },
        ]}
      />
    );
    // TODO: Set explicit date format for tests
    // expect(screen.getByTestId(locators.dateHeader)).toHaveTextContent(
    //   '1/1/1970'
    // );
    expect(screen.getByTestId('transactions-list')).toBeInTheDocument();
    const [firstTx, secondTx] = screen.getAllByTestId('transactions-list-item');
    expect(firstTx).toHaveTextContent('2');
    expect(secondTx).toHaveTextContent('1');
  });
});
