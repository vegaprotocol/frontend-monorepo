import type { BatchInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { MarketLink } from '../../../links';
import OrderSummary from '../../../order-summary/order-summary';

interface BatchOrderProps {
  index: number;
  submission: BatchInstruction;
}

/**
 * Table row for a single order in a batch submission
 */
export const BatchOrder = ({ index, submission }: BatchOrderProps) => {
  return (
    <tr>
      <td>{index}</td>
      <td>
        <TxOrderType orderType={'OrderCancellation'} />
      </td>
      <td>
        <OrderSummary order={submission} />
      </td>
      <td>
        <MarketLink id={submission.marketId} />
      </td>
    </tr>
  );
};
