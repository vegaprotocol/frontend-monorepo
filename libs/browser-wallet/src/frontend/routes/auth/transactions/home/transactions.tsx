import { ExternalLink } from '@/components/external-link';
import { BasePage } from '@/components/pages/page';
import { useNetwork } from '@/contexts/network/network-context';
import { useTransactionsStore } from '@/stores/transactions-store';

import { GroupedTransactionList } from './transactions-list';

export const locators = {
  transactions: 'transactions',
  transactionsDescription: 'transactions-description',
};

export const Transactions = () => {
  const { explorer, chainId } = useNetwork();
  const { transactions } = useTransactionsStore((state) => ({
    transactions: state.transactions,
  }));
  // TODO figure this out
  const filteredTransactions = transactions.filter(
    (tx) => tx.chainId === chainId
  );

  return (
    <BasePage dataTestId={locators.transactions} title="Transactions">
      <div className="mt-6">
        <p data-testid={locators.transactionsDescription} className="text-sm">
          This only includes transactions placed from this wallet, in order to
          see all transactions you can visit the{' '}
          <ExternalLink className="text-surface-0-fg mt-1" href={explorer}>
            <span className="underline">block explorer.</span>
          </ExternalLink>
        </p>
        <GroupedTransactionList transactions={filteredTransactions} />
      </div>
    </BasePage>
  );
};
