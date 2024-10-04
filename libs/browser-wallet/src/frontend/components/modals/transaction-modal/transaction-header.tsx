import { getTitle } from '@/lib/get-title';
import type { Transaction } from '@/lib/transactions';

import { Header } from '../../header';
import { SubHeader } from '../../sub-header';
import ReactTimeAgo from 'react-time-ago';

export const locators = {
  transactionRequest: 'transaction-request',
  transactionKey: 'transaction-key',
  transactionTimeAgo: 'transaction-time-ago',
};

export const TransactionHeader = ({
  name,
  transaction,
  receivedAt,
}: {
  name: string;
  transaction: Transaction;
  receivedAt: string;
}) => {
  return (
    <>
      <Header content={getTitle(transaction)} />
      <div className="mb-1 flex justify-between">
        <div className="flex items-center justify-between">
          <SubHeader content={`Signing with: ${name}`} />
        </div>
        <div
          data-testid={locators.transactionTimeAgo}
          className="text-sm text-surface-0-fg-muted"
        >
          Received{' '}
          <ReactTimeAgo
            timeStyle="round"
            date={new Date(receivedAt)}
            locale="en-US"
          />
        </div>
      </div>
    </>
  );
};
