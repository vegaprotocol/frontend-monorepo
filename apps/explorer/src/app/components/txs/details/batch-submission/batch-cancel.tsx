import type { BatchCancellationInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { TruncateInline } from '../../../truncate/truncate';
import { MarketLink } from '../../../links';

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
        <TruncateInline text={submission.orderId} />
      </td>
      <td>
        <MarketLink id={submission.marketId} />
      </td>
    </tr>
  );
};
