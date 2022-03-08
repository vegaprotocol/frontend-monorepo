import { Order, OrderType } from '.';
import { Button } from '@vegaprotocol/ui-toolkit';

interface TypeSelectorProps {
  order: Order;
  onSelect: (type: OrderType) => void;
}

export const TypeSelector = ({ order, onSelect }: TypeSelectorProps) => {
  return (
    <div className="flex gap-8 mb-12">
      {Object.entries(OrderType).map(([key, value]) => {
        return (
          <Button
            onClick={() => onSelect(value)}
            className="flex-1"
            type="button"
            variant={value === order.type ? 'accent' : undefined}
            key={key}
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};
