import { formatNumber, toBigNum } from '@vegaprotocol/utils';

import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';

import { NodeLink } from '../../vega-entities/node-link';
import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { AmountWithSymbol } from '../utils/string-amounts/amount-with-symbol';

export const DelegateSubmission = ({
  transaction,
}: ReceiptComponentProperties) => {
  const { amount } = transaction.delegateSubmission;
  // We know that VEGA always has 18 decimals
  const formattedAmount = formatNumber(toBigNum(amount, 18), 18);

  const items: RowConfig<typeof transaction.delegateSubmission>[] = [
    {
      prop: 'nodeId',
      render: (nodeId) => ['Node Id', <NodeLink nodeId={nodeId} />],
    },
    {
      prop: 'amount',
      render: () => [
        'Amount',
        <AmountWithSymbol amount={formattedAmount} symbol={'VEGA'} />,
      ],
    },
  ];
  return (
    <ReceiptWrapper>
      <ConditionalDataTable
        items={items}
        data={transaction.delegateSubmission}
      />
    </ReceiptWrapper>
  );
};
