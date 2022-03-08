import { Order, OrderSide } from '.';
import { Button } from '@vegaprotocol/ui-toolkit';

interface SideSelectorProps {
  order: Order;
  onSelect: (side: OrderSide) => void;
}

export const SideSelector = ({ order, onSelect }: SideSelectorProps) => {
  return (
    <div className="flex gap-8 mb-12">
      {Object.entries(OrderSide).map(([key, value]) => {
        return (
          <Button
            onClick={() => onSelect(value)}
            className="flex-1"
            type="button"
            variant={value === order.side ? 'accent' : undefined}
            key={key}
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};
