import { formatNumber, toBigNum } from '@vegaprotocol/utils';

import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { processUndelegateMethod, UNDELEGATE_METHOD_MAP } from '@/lib/enums';

import { NodeLink } from '../../vega-entities/node-link';
import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { AmountWithSymbol } from '../utils/string-amounts/amount-with-symbol';

export const UndelegateSubmission = ({
  transaction,
}: ReceiptComponentProperties) => {
  const items: RowConfig<typeof transaction.undelegateSubmission>[] = [
    {
      prop: 'nodeId',
      render: (nodeId) => ['Node Id', <NodeLink nodeId={nodeId} />],
    },
    {
      prop: 'amount',
      render: (amount) => [
        'Amount',
        <AmountWithSymbol
          amount={formatNumber(toBigNum(amount, 18), 18)}
          symbol={'VEGA'}
        />,
      ],
    },
    {
      prop: 'method',
      render: (method) => [
        'Method',
        <>{UNDELEGATE_METHOD_MAP[processUndelegateMethod(method)]}</>,
      ],
    },
  ];
  return (
    <ReceiptWrapper>
      <ConditionalDataTable
        items={items}
        data={transaction.undelegateSubmission}
      />
    </ReceiptWrapper>
  );
};
