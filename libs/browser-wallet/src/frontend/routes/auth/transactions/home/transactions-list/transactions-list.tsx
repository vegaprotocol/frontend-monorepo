import { NavLink } from 'react-router-dom';

import { ChevronRight } from '@/components/icons/chevron-right';
import { List } from '@/components/list';
import { getTitle } from '@/lib/get-title';
import { FULL_ROUTES } from '@/routes/route-names';
import type { StoredTransaction } from '@/types/backend';

import { VegaTransactionState } from '../../transactions-state';

export const locators = {
  transactionListItem: 'transaction-list-item',
  transactionListItemKeyName: 'transaction-list-item-key-name',
  transactionListItemTransactionType: 'transaction-list-item-transaction-type',
  transactionListItemLink: 'transaction-list-item-link',
};

export interface TransactionsListProperties {
  transactions: StoredTransaction[];
}

export const TransactionsList = ({
  transactions,
}: TransactionsListProperties) => {
  return (
    <List<StoredTransaction>
      items={transactions}
      renderItem={(transaction) => (
        <div
          data-testid={locators.transactionListItem}
          className="flex flex-row justify-between h-12"
        >
          <div className="flex flex-col w-full mr-2">
            <div className="flex flex-row items-center">
              <div
                data-testid={locators.transactionListItemTransactionType}
                className="text-surface-0-fg"
              >
                {getTitle(transaction.transaction)}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center text-sm mt-1">
              <div className="flex flex-row">
                <div
                  data-testid={locators.transactionListItemKeyName}
                  className="text-surface-0-fg-muted"
                >
                  {transaction.keyName}
                </div>
              </div>
              <VegaTransactionState state={transaction.state} />
            </div>
          </div>
          <NavLink
            data-testid={locators.transactionListItemLink}
            className="hover:bg-surface-2 w-12 h-full border-l border-1 border-surface-0-fg-muted flex items-center justify-center"
            to={`${FULL_ROUTES.transactions}/${transaction.id}`}
          >
            <ChevronRight />
          </NavLink>
        </div>
      )}
      idProp="id"
    />
  );
};
