import type { Transaction } from '@/lib/transactions';

import { CodeWindow } from '../../../code-window';
import { CollapsiblePanel } from '../../../collapsible-panel';
import { VegaSection } from '../../../vega-section';

export const RawTransaction = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <VegaSection>
      <CollapsiblePanel
        title="View raw transaction"
        initiallyOpen={false}
        panelContent={
          <CodeWindow
            text={JSON.stringify(transaction, null, '  ')}
            content={JSON.stringify(transaction, null, '  ')}
          />
        }
      />
    </VegaSection>
  );
};
