import type { components } from '../../../types/explorer';

import PriceInMarket from '../price-in-market/price-in-market';
import { sideText } from '../order-details/lib/order-labels';
import SizeInMarket from '../size-in-market/size-in-market';
import { t } from '@vegaprotocol/i18n';

export type OrderSummaryProps = {
  order: components['schemas']['v1OrderSubmission'];
};

/**
 * Shows a brief, relatively plaintext summary of an order transaction
 * showing the price, correctly formatted. Created for the Batch Submission
 * list, should be kept compact.
 *
 * Market name is expected to be listed elsewhere, so is not included
 */
const OrderTxSummary = ({ order }: OrderSummaryProps) => {
  // Render nothing if the Order Submission doesn't look right
  if (
    !order ||
    !order.marketId ||
    !order.side ||
    order.side === 'SIDE_UNSPECIFIED'
  ) {
    return null;
  }

  return (
    <div data-testid="order-summary">
      <span>{sideText[order.side]}</span>&nbsp;
      {order.size ? (
        <SizeInMarket size={order.size} marketId={order.marketId} />
      ) : (
        '-'
      )}
      &nbsp;<i className="text-xs">@</i>&nbsp;
      {order.price ? (
        <PriceInMarket
          marketId={order.marketId}
          price={order.price}
        ></PriceInMarket>
      ) : (
        t('Market Price')
      )}
    </div>
  );
};

export default OrderTxSummary;
