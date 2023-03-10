import type { BatchCancellationInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { MarketLink } from '../../../links';
import OrderSummary from '../../../order-summary/order-summary';
import { CancelSummary } from '../../../order-summary/order-cancellation';

interface BatchCancelProps {
  index: number;
  submission: BatchCancellationInstruction;
}

/**
 * Table row for a single cancellation in a batch submission
 */
export const BatchCancel = ({ index, submission }: BatchCancelProps) => {
  return (
    <tr>
      <td>{index}</td>
      <td>
        <TxOrderType orderType={'OrderCancellation'} />
      </td>
      <td>
        {submission.orderId ? (
          <OrderSummary id={submission.orderId} modifier="cancelled" />
        ) : (
          <CancelSummary
            orderId={submission.orderId}
            marketId={submission.marketId}
          />
        )}
      </td>
      <td>
        <MarketLink id={submission.marketId} />
      </td>
    </tr>
  );
};
