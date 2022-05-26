import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';

export interface DealTicketMarketFormProps {
  quoteName?: string;
  price?: string;
  size: string;
  step: number;
  onSizeChange: (size: string) => void;
}

export const DealTicketMarketForm = ({
  size,
  onSizeChange,
  price,
  step,
  quoteName,
}: DealTicketMarketFormProps) => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex-1">
        <FormGroup label="Amount">
          <Input
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-full"
            type="number"
            step={step}
            min={step}
            data-testid="order-size"
          />
        </FormGroup>
      </div>
      <div className="pt-4">@</div>
      <div className="flex-1 pt-4" data-testid="last-price">
        {price && quoteName ? (
          <>
            ~{price} {quoteName}
          </>
        ) : (
          '-'
        )}
      </div>
    </div>
  );
};
