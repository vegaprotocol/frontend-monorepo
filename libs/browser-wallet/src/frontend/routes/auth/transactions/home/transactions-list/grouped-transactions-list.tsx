import { format } from 'date-fns';
import groupBy from 'lodash/groupBy';

import { VegaSection } from '@/components/vega-section';
import { formatDate } from '@/lib/utils';
import type { StoredTransaction } from '@/types/backend';

import { TransactionsList } from './transactions-list';
import { TransactionListEmpty } from './transactions-list-empty';

export const locators = {
  dateHeader: 'date-header',
};

export const GroupedTransactionList = ({
  transactions,
}: {
  transactions: StoredTransaction[];
}) => {
  const transactionsByDate = transactions.map((transaction) => ({
    ...transaction,
    daySent: format(new Date(transaction.decision), 'yyyy-MM-dd'),
  }));
  const groupedTransactions = groupBy(transactionsByDate, 'daySent');
  const hasTransactions = Object.keys(groupedTransactions).length > 0;
  if (!hasTransactions) return <TransactionListEmpty />;
  return (
    <section>
      {Object.keys(groupedTransactions).map((date) => (
        <VegaSection key={date}>
          <h1
            data-testid={locators.dateHeader}
            className="text-surface-0-fg-muted uppercase"
          >
            {formatDate(date)}
          </h1>
          <TransactionsList
            transactions={[
              ...groupedTransactions[date].sort((a, b) => {
                return (
                  new Date(b.decision).getTime() -
                  new Date(a.decision).getTime()
                );
              }),
            ]}
          />
        </VegaSection>
      ))}
    </section>
  );
};
