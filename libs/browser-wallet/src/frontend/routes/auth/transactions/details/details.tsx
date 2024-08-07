import { useParams } from 'react-router-dom';

import { BasePage } from '@/components/pages/page';
import { getTitle } from '@/lib/get-title';
import { FULL_ROUTES } from '@/routes/route-names';
import { useTransactionsStore } from '@/stores/transactions-store';

import { TransactionData } from './transaction-data';
import { TransactionMetadata } from './transaction-metadata';

interface Params extends Record<string, string> {
  id: string;
}

export const TransactionDetails = () => {
  const { id } = useParams<Params>();
  const { transactions } = useTransactionsStore((state) => ({
    transactions: state.transactions,
  }));
  const transaction = transactions.find((tx) => tx.id === id);
  if (!transaction) {
    throw new Error(`Could not find transaction with id ${id}`);
  }

  return (
    <BasePage
      backLocation={FULL_ROUTES.transactions}
      dataTestId={'transaction'}
      title={getTitle(transaction.transaction)}
    >
      <section>
        <TransactionMetadata transaction={transaction} />
        <TransactionData transaction={transaction} />
      </section>
    </BasePage>
  );
};
