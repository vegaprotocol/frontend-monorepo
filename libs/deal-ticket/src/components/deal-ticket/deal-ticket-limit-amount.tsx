import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { toDecimal, validateAmount } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { Controller } from 'react-hook-form';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'marketData' | 'type'
>;

export const DealTicketLimitAmount = ({
  control,
  market,
  sizeError,
  priceError,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market?.decimalPlaces);
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const quoteName =
    'quoteName' in market.tradableInstrument.instrument.product
      ? market.tradableInstrument.instrument.product.quoteName
      : '';

  const renderError = () => {
    if (sizeError) {
      return (
        <InputError testId="deal-ticket-error-message-size-limit">
          {sizeError}
        </InputError>
      );
    }

    if (priceError) {
      return (
        <InputError testId="deal-ticket-error-message-price-limit">
          {priceError}
        </InputError>
      );
    }

    return null;
  };

  return (
    <div className="mb-2">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <FormGroup
            label={t('Size')}
            labelFor="input-order-size-limit"
            className="!mb-0"
          >
            <Controller
              name="size"
              control={control}
              rules={{
                required: t('You need to provide a size'),
                min: {
                  value: sizeStep,
                  message: t('Size cannot be lower than ' + sizeStep),
                },
                validate: validateAmount(sizeStep, 'Size'),
              }}
              render={({ field }) => (
                <Input
                  id="input-order-size-limit"
                  className="w-full"
                  type="number"
                  step={sizeStep}
                  min={sizeStep}
                  data-testid="order-size"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
                />
              )}
            />
          </FormGroup>
        </div>
        <div className="pt-7 leading-10">@</div>
        <div className="flex-1">
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Price (${quoteName})`)}
            labelAlign="right"
            className="!mb-0"
          >
            <Controller
              name="price"
              control={control}
              rules={{
                required: t('You need provide a price'),
                min: {
                  value: priceStep,
                  message: t('Price cannot be lower than ' + priceStep),
                },
                validate: validateAmount(priceStep, 'Price'),
              }}
              render={({ field }) => (
                <Input
                  id="input-price-quote"
                  className="w-full"
                  type="number"
                  step={priceStep}
                  data-testid="order-price"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
                />
              )}
            />
          </FormGroup>
        </div>
      </div>
      {renderError()}
    </div>
  );
};
