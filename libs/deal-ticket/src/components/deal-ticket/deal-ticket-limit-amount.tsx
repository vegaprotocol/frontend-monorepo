import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { validateAmount } from '../deal-ticket-validation';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  register,
  market,
  quoteName,
  sizeError,
  priceError,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market?.decimalPlaces);
  const sizeStep = toDecimal(market?.positionDecimalPlaces);

  return (
    <div className="mb-6">
      <div className="grid grid-rows-[min-content] grid-cols-[1fr,min-content,1fr] gap-x-3 gap-y-1">
        <div>
          <FormGroup
            label={t('Size')}
            labelFor="input-order-size-limit"
            className="!mb-1"
          >
            <Input
              id="input-order-size-limit"
              className="w-full"
              type="number"
              step={sizeStep}
              min={sizeStep}
              data-testid="order-size"
              onWheel={(e) => e.currentTarget.blur()}
              {...register('size', {
                required: t('You need to provide a size'),
                min: {
                  value: sizeStep,
                  message: t('Amount must be greater than ' + sizeStep),
                },
                validate: validateAmount(sizeStep),
              })}
            />
          </FormGroup>
        </div>
        <div>
          <div className="flex">&nbsp;</div>
          <div className="flex">@</div>
        </div>
        <div>
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Price (${quoteName})`)}
            labelAlign="right"
            className="!mb-1"
          >
            <Input
              id="input-price-quote"
              className="w-full"
              type="number"
              step={priceStep}
              data-testid="order-price"
              onWheel={(e) => e.currentTarget.blur()}
              {...register('price', {
                required: t('You need to provide a price'),
                min: {
                  value: priceStep,
                  message: t('Price cannot be lower than ' + priceStep),
                },
                validate: validateAmount(priceStep),
              })}
            />
          </FormGroup>
        </div>
        <div>
          {sizeError && (
            <InputError intent="danger" data-testid="deal-ticket-error-message">
              {sizeError}
            </InputError>
          )}
        </div>
        <div />
        <div>
          {priceError && (
            <InputError
              intent="danger"
              data-testid="deal-ticket-error-message-price-limit"
            >
              {priceError}
            </InputError>
          )}
        </div>
      </div>
    </div>
  );
};
