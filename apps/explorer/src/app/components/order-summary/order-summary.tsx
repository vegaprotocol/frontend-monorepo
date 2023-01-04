import type { components } from '../../../types/explorer';

import PriceInMarket from '../price-in-market/price-in-market';
import { sideText } from '../order-details/lib/order-labels';

export type OrderSummaryProps = {
  order: components['schemas']['v1OrderSubmission'];
};

/**
 * Given a market ID, it will fetch the market name and show that,
 * with a link to the markets list. If the name does not come back
 * it will use the ID instead
 */
const OrderSummary = ({ order }: OrderSummaryProps) => {
  if (!order || !order.marketId || !order.price || !order.side) {
    return null;
  }

  return (
    <span>
      {sideText[order.side]}&nbsp;
      {order.size}&nbsp;<i className="text-xs">@</i>&nbsp;
      <PriceInMarket
        marketId={order.marketId}
        price={order.price}
      ></PriceInMarket>
    </span>
  );
};

export default OrderSummary;
