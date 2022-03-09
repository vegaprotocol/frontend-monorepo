import { Button } from '@vegaprotocol/ui-toolkit';
import { Order, OrderSide } from '../../hooks/use-order-state';

interface SideSelectorProps {
  order: Order;
  onSelect: (side: OrderSide) => void;
}

export const SideSelector = ({ order, onSelect }: SideSelectorProps) => {
  return (
    <div className="flex gap-8 mb-20">
      {Object.entries(OrderSide).map(([key, value]) => {
        const isSelected = value === order.side;
        return (
          <Button
            onClick={() => onSelect(value)}
            className="flex-1"
            type="button"
            variant={isSelected ? 'accent' : undefined}
            data-testid={
              isSelected
                ? `order-side-${value}-selected`
                : `order-side-${value}`
            }
            key={key}
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};
