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
  const { network } = useNetwork();
  const { transactions } = useTransactionsStore((state) => ({
    transactions: state.transactions,
  }));
  const filteredTransactions = transactions.filter(
    (tx) => tx.networkId === network.id
  );

  return (
    <BasePage dataTestId={locators.transactions} title="Transactions">
      <div className="mt-6">
        <p data-testid={locators.transactionsDescription} className="text-sm">
          This only includes transactions placed from this wallet, in order to
          see all transactions you can visit the{' '}
          <ExternalLink className="text-white mt-1" href={network.explorer}>
            <span className="underline">block explorer.</span>
          </ExternalLink>
        </p>
        <GroupedTransactionList transactions={filteredTransactions} />
      </div>
    </BasePage>
  );
};
