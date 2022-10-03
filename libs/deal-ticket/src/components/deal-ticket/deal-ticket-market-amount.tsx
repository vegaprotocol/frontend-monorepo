import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { validateSize } from '@vegaprotocol/orders';
import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  price,
  market,
  quoteName,
}: DealTicketMarketAmountProps) => {
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <FormGroup label={t('Size')} labelFor="input-order-size-market">
          <Input
            id="input-order-size-market"
            className="w-full"
            type="number"
            step={sizeStep}
            min={sizeStep}
            onWheel={(e) => e.currentTarget.blur()}
            data-testid="order-size"
            {...register('size', {
              required: true,
              min: sizeStep,
              validate: validateSize(sizeStep),
            })}
          />
        </FormGroup>
      </div>
      <div>@</div>
      <div className="flex-1" data-testid="last-price">
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
