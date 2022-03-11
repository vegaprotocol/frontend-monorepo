import { Button, FormGroup } from '@vegaprotocol/ui-toolkit';
import { Order, OrderType } from '../../hooks/use-order-state';

interface TypeSelectorProps {
  order: Order;
  onSelect: (type: OrderType) => void;
}

export const TypeSelector = ({ order, onSelect }: TypeSelectorProps) => {
  return (
    <FormGroup label="Order type">
      <div className="flex gap-8">
        {Object.entries(OrderType).map(([key, value]) => {
          const isSelected = value === order.type;
          return (
            <Button
              onClick={() => onSelect(value)}
              className="flex-1"
              type="button"
              variant={isSelected ? 'accent' : undefined}
              data-testid={
                isSelected
                  ? `order-type-${value}-selected`
                  : `order-type-${value}`
              }
              key={key}
            >
              {key}
            </Button>
          );
        })}
      </div>
    </FormGroup>
  );
};
