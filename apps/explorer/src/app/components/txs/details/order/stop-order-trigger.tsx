import { useExplorerStopOrderQuery } from '../../../order-details/__generated__/StopOrder';
import OrderSummary from '../../../order-summary/order-summary';

export interface StopOrderTriggerSummaryProps {
  id: string;
}

/**
 */
const StopOrderTriggerSummary = ({ id }: StopOrderTriggerSummaryProps) => {
  const { data, error } = useExplorerStopOrderQuery({
    variables: { stopOrderId: id },
  });

  if (error || !data || (data && !data.stopOrder)) {
    return <div data-testid="stop-order-trigger-summary">-</div>;
  }

  const stopOrderTrigger = data.stopOrder;
  return (
    <div data-testid="stop-order-trigger-summary">
      <p>{stopOrderTrigger?.status}</p>
      {stopOrderTrigger?.order?.id && (
        <OrderSummary id={stopOrderTrigger?.order.id} />
      )}
    </div>
  );
};

export default StopOrderTriggerSummary;
