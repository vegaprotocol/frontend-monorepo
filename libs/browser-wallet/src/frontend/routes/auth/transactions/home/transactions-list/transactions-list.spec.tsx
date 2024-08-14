import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { type StoredTransaction, TransactionState } from '@/types/backend';

import { testingNetwork } from '../../../../../../config/well-known-networks';
import { locators, TransactionsList } from './transactions-list';
jest.mock('../../transactions-state', () => ({
  VegaTransactionState: () => <div data-testid="transaction-state" />,
}));
jest.mock('./transactions-list-empty', () => ({
  TransactionListEmpty: () => <div data-testid="empty" />,
}));

const renderComponent = (transactions: StoredTransaction[]) => {
  return render(
    <MemoryRouter>
      <TransactionsList transactions={transactions} />
    </MemoryRouter>
  );
};

describe('TransactionList', () => {
  it('renders host image, transaction type, key used, time it was confirmed, transaction state and link', async () => {
    // 1148-TXLS-004 I can see a list of all transactions, including the transaction type, sending key, time sent and internal status of the transaction
    // 1148-TXLS-005 I can see a link to the transaction details page for each transaction
    renderComponent([
      {
        publicKey: '0'.repeat(64),
        id: '1',
        transaction: { transfer: {} },
        sendingMode: 'SYNC',
        keyName: 'Key 1',
        walletName: 'Wallet 1',
        origin: 'https://foo.com',
        receivedAt: new Date().toISOString(),
        networkId: testingNetwork.id,
        chainId: testingNetwork.chainId,
        decision: new Date().toISOString(),
        state: TransactionState.Confirmed,
        node: 'https://node.com',
        autoApproved: false,
        error: undefined,
        hash: undefined,
        code: undefined,
      },
    ]);
    expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
    expect(screen.getByTestId('host-image')).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.transactionListItemTransactionType)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.transactionListItemKeyName)
    ).toBeInTheDocument();
    expect(screen.getByTestId('transaction-state')).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.transactionListItemLink)
    ).toBeInTheDocument();
  });
});
