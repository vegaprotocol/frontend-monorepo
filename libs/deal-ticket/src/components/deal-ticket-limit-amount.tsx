import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { validateSize } from '../utils/validate-size';
import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  register,
  step,
  quoteName,
}: DealTicketLimitAmountProps) => {
  return (
    <div className="flex items-center gap-8">
      <div className="flex-1">
        <FormGroup label="Amount">
          <Input
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
      <div>@</div>
      <div className="flex-1">
        <FormGroup label={`Price (${quoteName})`} labelAlign="right">
          <Input
            className="w-full"
            type="number"
            step={step}
            defaultValue={0}
            data-testid="order-price"
            {...register('price', { required: true, min: 0 })}
          />
        </FormGroup>
      </div>
    </div>
  );
};
