import type { TransactionKeys } from '@/lib/transactions';

import { ReceiptViewErrorBoundary } from './receipt-error-boundary';
import type { ReceiptComponentProperties } from './receipts';
import { TransactionMap } from './transaction-map';

export const TransactionSwitch = ({
  transaction,
}: ReceiptComponentProperties) => {
  const type = Object.keys(transaction)[0] as TransactionKeys;
  const Component = TransactionMap[type];
  if (Component)
    return (
      <ReceiptViewErrorBoundary>
        <Component transaction={transaction} />
      </ReceiptViewErrorBoundary>
    );
  return null;
};
