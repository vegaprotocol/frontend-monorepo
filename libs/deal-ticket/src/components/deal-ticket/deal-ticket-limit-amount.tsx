import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
} from '@vegaprotocol/ui-toolkit';
import { toDecimal, validateAmount } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { Controller } from 'react-hook-form';
import { getQuoteName } from '@vegaprotocol/markets';

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
  const quoteName = getQuoteName(market);

  const renderError = () => {
    if (sizeError) {
      return (
        <TradingInputError testId="deal-ticket-error-message-size-limit">
          {sizeError}
        </TradingInputError>
      );
    }

    if (priceError) {
      return (
        <TradingInputError testId="deal-ticket-error-message-price-limit">
          {priceError}
        </TradingInputError>
      );
    }

    return null;
  };

  return (
    <div className="mb-2">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <TradingFormGroup
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
              render={({ field, fieldState }) => (
                <TradingInput
                  id="input-order-size-limit"
                  className="w-full"
                  type="number"
                  step={sizeStep}
                  min={sizeStep}
                  data-testid="order-size"
                  onWheel={(e) => e.currentTarget.blur()}
                  hasError={!!fieldState.error}
                  {...field}
                />
              )}
            />
          </TradingFormGroup>
        </div>
        <div className="pt-5 leading-10">@</div>
        <div className="flex-1">
          <TradingFormGroup
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
              render={({ field, fieldState }) => (
                <TradingInput
                  id="input-price-quote"
                  className="w-full"
                  type="number"
                  step={priceStep}
                  data-testid="order-price"
                  onWheel={(e) => e.currentTarget.blur()}
                  hasError={!!fieldState.error}
                  {...field}
                />
              )}
            />
          </TradingFormGroup>
        </div>
      </div>
      {renderError()}
    </div>
  );
};
