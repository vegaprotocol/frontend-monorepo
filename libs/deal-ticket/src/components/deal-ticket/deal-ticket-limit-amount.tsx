import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import { validateSize } from '@vegaprotocol/orders';
import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  register,
  market,
  quoteName,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market.decimalPlaces);
  const sizeStep = toDecimal(market.positionDecimalPlaces);

  return (
    <div className="flex items-center gap-8">
      <div className="flex-1">
        <FormGroup label={t('Size')} labelFor="input-order-size-limit">
          <Input
            id="input-order-size-limit"
            className="w-full"
            type="number"
            step={sizeStep}
            min={sizeStep}
            data-testid="order-size"
            {...register('size', {
              required: true,
              min: sizeStep,
              validate: validateSize(sizeStep),
            })}
          />
        </FormGroup>
      </div>
      <div className="pt-4 text-black dark:text-white">@</div>
      <div className="flex-1">
        <FormGroup
          labelFor="input-price-quote"
          label={t(`Price (${quoteName})`)}
          labelAlign="right"
        >
          <Input
            id="input-price-quote"
            className="w-full"
            type="number"
            step={priceStep}
            defaultValue={0}
            data-testid="order-price"
            {...register('price', {
              required: true,
              min: 0,
            })}
          />
        </FormGroup>
      </div>
    </div>
  );
};
