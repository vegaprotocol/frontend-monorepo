import { RawTransaction } from '@/components/modals/transaction-modal/sections/raw-transaction';
import { TransactionSwitch } from '@/components/receipts';
import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';
import type { StoredTransaction } from '@/types/backend';

interface TransactionSectionProperties {
  transaction: StoredTransaction;
}

export const TransactionData = ({
  transaction,
}: TransactionSectionProperties) => {
  return (
    <VegaSection>
      <SubHeader content="Transaction data" />
      <TransactionSwitch transaction={transaction.transaction} />
      <RawTransaction transaction={transaction.transaction} />
    </VegaSection>
  );
};
