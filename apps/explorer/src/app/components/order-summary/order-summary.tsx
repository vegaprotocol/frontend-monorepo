import { useExplorerDeterministicOrderQuery } from '../order-details/__generated__/Order';
import { PriceInMarket } from '../price-in-market/price-in-market';
import { sideText } from '../order-details/lib/order-labels';
import { SizeInMarket } from '../size-in-market/size-in-market';

// Note: Edited has no style currently
export type OrderSummaryModifier = 'cancelled' | 'edited';

/**
 * Provides Tailwind classnames to apply to order
 * @param modifier
 * @returns string
 */
export function getClassName(modifier?: OrderSummaryModifier) {
  if (modifier === 'cancelled') {
    return 'line-through';
  }

  return undefined;
}

export interface OrderSummaryProps {
  id: string;
  modifier?: OrderSummaryModifier;
}

/**
 * This component renders the *current* details for an order, like OrderDetails but much
 * more compact. It is equivalent to OrderTxSummary, but operates on an order rather than
 * the transaction that creates an order
 */
const OrderSummary = ({ id, modifier }: OrderSummaryProps) => {
  const { data, error } = useExplorerDeterministicOrderQuery({
    variables: { orderId: id },
  });

  if (error || !data || (data && !data.orderByID)) {
    return <div data-testid="order-summary">-</div>;
  }

  const order = data.orderByID;
  return (
    <div data-testid="order-summary" className={getClassName(modifier)}>
      <span>{sideText[order.side]}</span>&nbsp;
      <SizeInMarket marketId={order.market.id} size={order.size} />
      &nbsp;<i>@</i>&nbsp;
      <PriceInMarket marketId={order.market.id} price={order.price} />
    </div>
  );
};

export default OrderSummary;
