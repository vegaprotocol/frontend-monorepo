import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { validateSize } from '../utils/validate-size';
import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  price,
  step,
  quoteName,
}: DealTicketMarketAmountProps) => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex-1">
        <FormGroup label="Amount" labelFor="input-order-size-market">
          <Input
            id="input-order-size-market"
            className="w-full"
            type="number"
            step={step}
            min={step}
            data-testid="order-size"
            {...register('size', {
              required: true,
              min: step,
              validate: validateSize(step),
            })}
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
