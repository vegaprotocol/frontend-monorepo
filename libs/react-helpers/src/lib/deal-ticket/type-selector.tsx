import { Order, OrderType } from '.';
import { Button } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  order: Order;
  onSelect: (type: OrderType) => void;
}

export const TypeSelector = ({ order, onSelect }: TypeSelectorProps) => {
  return (
    <div className="flex gap-2">
      {Object.entries(OrderType).map(([key, value]) => {
        return (
          <Button
            onClick={() => onSelect(value)}
            className="flex-1"
            type="button"
            variant={value === order.type ? 'accent' : undefined}
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};
