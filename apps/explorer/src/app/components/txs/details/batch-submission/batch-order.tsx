import type { BatchInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { MarketLink } from '../../../links';
import OrderTxSummary from '../../../order-summary/order-tx-summary';

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
        <TxOrderType orderType={'OrderSubmission'} />
      </td>
      <td>
        <OrderTxSummary order={submission} />
      </td>
      <td>
        <MarketLink id={submission.marketId} />
      </td>
    </tr>
  );
};
