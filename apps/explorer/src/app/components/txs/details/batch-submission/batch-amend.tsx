import type { BatchInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { TruncateInline } from '../../../truncate/truncate';
import { MarketLink } from '../../../links';

interface BatchAmendProps {
  index: number;
  submission: BatchInstruction;
}

/**
 * Table row for a single amendment in a batch submission
 */
export const BatchAmend = ({ index, submission }: BatchAmendProps) => {
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
