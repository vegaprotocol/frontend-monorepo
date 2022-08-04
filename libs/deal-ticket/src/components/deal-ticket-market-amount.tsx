import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { validateSize } from '@vegaprotocol/orders';
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
        <FormGroup label={t('Size')} labelFor="input-order-size-market">
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
      <div className="pt-4 text-black dark:text-white">@</div>
      <div
        className="flex-1 pt-4 text-black dark:text-white"
        data-testid="last-price"
      >
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
