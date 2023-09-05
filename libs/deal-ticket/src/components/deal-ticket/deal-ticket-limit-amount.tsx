import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { toDecimal, validateAmount } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { Controller } from 'react-hook-form';

export type DealTicketLimitAmountProps = Omit<
  Omit<DealTicketAmountProps, 'marketData'>,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  control,
  market,
  sizeError,
  priceError,
  update,
  price,
  size,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market?.decimalPlaces);
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const quoteName = market.tradableInstrument.instrument.product.quoteName;

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
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FormGroup
            label={t('Size')}
            labelFor="input-order-size-limit"
            className="!mb-1"
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
              render={() => (
                <Input
                  id="input-order-size-limit"
                  className="w-full"
                  type="number"
                  value={size}
                  onChange={(e) => update({ size: e.target.value })}
                  step={sizeStep}
                  min={sizeStep}
                  data-testid="order-size"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              )}
            />
          </FormGroup>
        </div>
        <div className="flex-0 items-center">
          <div className="flex">&nbsp;</div>
          <div className="flex">@</div>
        </div>
        <div className="flex-1">
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Price (${quoteName})`)}
            labelAlign="right"
            className="!mb-1"
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
                // @ts-ignore this fulfills the interface but still errors
                validate: validateAmount(priceStep, 'Price'),
              }}
              render={() => (
                <Input
                  id="input-price-quote"
                  className="w-full"
                  type="number"
                  value={price}
                  onChange={(e) => update({ price: e.target.value })}
                  step={priceStep}
                  data-testid="order-price"
                  onWheel={(e) => e.currentTarget.blur()}
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
