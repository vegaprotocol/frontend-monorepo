import { Controller, type Control } from 'react-hook-form';
import type { Market } from '@vegaprotocol/markets';
import type { OrderFormValues } from '../../hooks/use-form-values';
import { toDecimal, useValidateAmount } from '@vegaprotocol/utils';
import {
  TradingFormGroup,
  TradingInputError,
  Tooltip,
  FormGroup,
  Input,
  InputError,
  Pill,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';
import { type Side } from '@vegaprotocol/types';

export interface DealTicketPriceTakeProfitStopLossProps {
  control: Control<OrderFormValues>;
  market: Market;
  takeProfitError?: string;
  stopLossError?: string;
  setPrice?: string;
  takeProfit?: string;
  stopLoss?: string;
  side?: Side;
  quoteName?: string;
}

export const DealTicketPriceTakeProfitStopLoss = ({
  control,
  market,
  takeProfitError,
  stopLossError,
  quoteName,
  setPrice,
  takeProfit,
  stopLoss,
  side,
}: DealTicketPriceTakeProfitStopLossProps) => {
  const t = useT();
  const validateAmount = useValidateAmount();
  const priceStep = toDecimal(market?.decimalPlaces);

  const renderTakeProfitError = () => {
    if (takeProfitError) {
      return (
        <TradingInputError testId="deal-ticket-take-profit-error-message">
          {takeProfitError}
        </TradingInputError>
      );
    }

    return null;
  };

  const renderStopLossError = () => {
    if (stopLossError) {
      return (
        <TradingInputError testId="deal-stop-loss-error-message">
          {stopLossError}
        </TradingInputError>
      );
    }

    return null;
  };

  return (
    <div className="mb-2">
      <div className="flex flex-col gap-2">
        <div className="flex-1">
          <TradingFormGroup
            label={
              <Tooltip
                description={<div>{t('The price for take profit.')}</div>}
              >
                <span className="text-xs">{t('Take profit')}</span>
              </Tooltip>
            }
            labelFor="input-order-take-profit"
            className="!mb-1"
          >
            <Controller
              name="takeProfit"
              control={control}
              rules={{
                required: t('You need provide a take profit price'),
                min: {
                  value: priceStep,
                  message: t(
                    'Take profit price cannot be lower than {{priceStep}}',
                    {
                      priceStep,
                    }
                  ),
                },
                validate: validateAmount(priceStep, 'takeProfit'),
              }}
              render={({ field, fieldState }) => (
                <div className="mb-2">
                  <FormGroup
                    labelFor="input-price-take-profit"
                    label={''}
                    compact
                  >
                    <Input
                      id="input-price-take-profit"
                      appendElement={<Pill size="xs">{quoteName}</Pill>}
                      className="w-full"
                      type="number"
                      step={priceStep}
                      data-testid="order-price-take-profit"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...field}
                    />
                  </FormGroup>
                  {fieldState.error && (
                    <InputError testId="deal-ticket-error-message-price-take-profit">
                      {fieldState.error.message}
                    </InputError>
                  )}
                </div>
              )}
            />
          </TradingFormGroup>
        </div>
        <div className="flex-1">
          <TradingFormGroup
            label={
              <Tooltip description={<div>{t('The price for stop loss.')}</div>}>
                <span className="text-xs">{t('Stop loss')}</span>
              </Tooltip>
            }
            labelFor="input-order-stop-loss"
            className="!mb-1"
          >
            <Controller
              name="stopLoss"
              control={control}
              rules={{
                required: t('You need provide a stop loss price'),
                min: {
                  value: priceStep,
                  message: t('Price cannot be lower than {{priceStep}}', {
                    priceStep,
                  }),
                },
                validate: validateAmount(priceStep, 'stopLoss'),
              }}
              render={({ field, fieldState }) => (
                <div className="mb-2">
                  <FormGroup
                    labelFor="input-price-stop-loss"
                    label={''}
                    compact
                  >
                    <Input
                      id="input-price-stop-loss"
                      appendElement={<Pill size="xs">{quoteName}</Pill>}
                      className="w-full"
                      type="number"
                      step={priceStep}
                      data-testid="order-price-stop-loss"
                      onWheel={(e) => e.currentTarget.blur()}
                      {...field}
                    />
                  </FormGroup>
                  {fieldState.error && (
                    <InputError testId="deal-ticket-error-message-price-stop-loss">
                      {fieldState.error.message}
                    </InputError>
                  )}
                </div>
              )}
            />
          </TradingFormGroup>
        </div>
      </div>
      {renderTakeProfitError()}
      {renderStopLossError()}
    </div>
  );
};
