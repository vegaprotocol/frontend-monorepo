import { TransactionSwitch } from '../../../receipts';
import type { ReceiptComponentProperties } from '../../../receipts/receipts';
import { hasReceiptView } from '../../../receipts/transaction-map';

export const EnrichedDetails = ({
  transaction,
}: ReceiptComponentProperties) => {
  const renderReceipt = hasReceiptView(transaction);
  return renderReceipt ? <TransactionSwitch transaction={transaction} /> : null;
};
