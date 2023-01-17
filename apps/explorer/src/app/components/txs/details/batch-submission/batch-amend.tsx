import type { BatchInstruction } from '../../../../routes/types/block-explorer-response';
import { TxOrderType } from '../../tx-order-type';
import { MarketLink } from '../../../links';
import OrderSummary from '../../../order-summary/order-summary';

interface BatchAmendProps {
  index: number;
  submission: BatchInstruction;
}

/**
 * Table row for a single amendment in a batch submission
 */
export const BatchAmend = ({ index, submission }: BatchAmendProps) => {
  return (
    <tr key={`amend-${index}`}>
      <td>{index}</td>
      <td>
        <TxOrderType orderType={'OrderAmendment'} />
      </td>
      <td>
        <OrderSummary id={submission.orderId} modifier="edited" />
      </td>
      <td>
        <MarketLink id={submission.marketId} />
      </td>
    </tr>
  );
};
