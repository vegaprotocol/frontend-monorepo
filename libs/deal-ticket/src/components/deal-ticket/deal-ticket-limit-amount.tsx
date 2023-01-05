import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal, validateAmount } from '@vegaprotocol/react-helpers';
import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  register,
  market,
  sizeError,
  priceError,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market?.decimalPlaces);
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const quoteName =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;

  const renderError = () => {
    if (sizeError) {
      return (
        <InputError data-testid="dealticket-error-message-size-limit">
          {sizeError}
        </InputError>
      );
    }

    if (priceError) {
      return (
        <InputError data-testid="dealticket-error-message-price-limit">
          {priceError}
        </InputError>
      );
    }

    return null;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
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
                  message: t('Size cannot be lower than ' + sizeStep),
                },
                validate: validateAmount(sizeStep, 'Size'),
              })}
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
            <Input
              id="input-price-quote"
              className="w-full"
              type="number"
              step={priceStep}
              data-testid="order-price"
              onWheel={(e) => e.currentTarget.blur()}
              {...register('price', {
                required: t('You need provide a price'),
                min: {
                  value: priceStep,
                  message: t('Price cannot be lower than ' + priceStep),
                },
                // @ts-ignore this fulfills the interface but still errors
                validate: validateAmount(priceStep, 'Price'),
              })}
            />
          </FormGroup>
        </div>
      </div>
      {renderError()}
    </div>
  );
};
