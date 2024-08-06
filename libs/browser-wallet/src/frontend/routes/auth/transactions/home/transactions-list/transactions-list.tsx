import { NavLink } from 'react-router-dom';

import { HostImage } from '@/components/host-image';
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
              <HostImage hostname={transaction.origin} size={20} />
              <div
                data-testid={locators.transactionListItemTransactionType}
                className="ml-2 text-white"
              >
                {getTitle(transaction.transaction)}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center text-sm mt-1">
              <div className="flex flex-row">
                <div
                  data-testid={locators.transactionListItemKeyName}
                  className="text-vega-dark-300"
                >
                  {transaction.keyName}
                </div>
              </div>
              <VegaTransactionState state={transaction.state} />
            </div>
          </div>
          <NavLink
            data-testid={locators.transactionListItemLink}
            className="hover:bg-vega-dark-200 w-12 h-full border-l border-1 border-vega-dark-150 flex items-center justify-center"
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
