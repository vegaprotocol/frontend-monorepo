import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';

export interface DealTicketLimitFormProps {
  quoteName: string;
  price?: string;
  size: string;
  onSizeChange: (size: string) => void;
  onPriceChange: (price: string) => void;
}

export const DealTicketLimitForm = ({
  size,
  price,
  onSizeChange,
  onPriceChange,
  quoteName,
}: DealTicketLimitFormProps) => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex-1">
        <FormGroup label="Amount">
          <Input
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-full"
            type="number"
            data-testid="order-size"
          />
        </FormGroup>
      </div>
      <div>@</div>
      <div className="flex-1">
        <FormGroup label={`Price (${quoteName})`} labelAlign="right">
          <Input
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full"
            type="number"
            data-testid="order-price"
          />
        </FormGroup>
      </div>
    </div>
  );
};
