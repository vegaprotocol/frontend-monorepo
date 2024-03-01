import { Controller, type Control } from 'react-hook-form';
import type { Market } from '@vegaprotocol/markets';
import type { OrderFormValues } from '../../hooks/use-form-values';
import { toDecimal, useValidateAmount } from '@vegaprotocol/utils';
import {
  TradingFormGroup,
  TradingInput,
  TradingInputError,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';
import { type Side } from '@vegaprotocol/types';

export interface DealTicketSizeTakeProfitStopLossProps {
  control: Control<OrderFormValues>;
  market: Market;
  takeProfitError?: string;
  stopLossError?: string;
  setPrice?: string;
  takeProfit?: string;
  stopLoss?: string;
  side?: Side;
}

export const DealTicketSizeTakeProfitStopLoss = ({
  control,
  market,
  takeProfitError,
  stopLossError,
  setPrice,
  takeProfit,
  stopLoss,
  side,
}: DealTicketSizeTakeProfitStopLossProps) => {
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
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <TradingFormGroup
            label={
              <Tooltip
                description={
                  <div>{t('The price at which you can take profit.')}</div>
                }
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
                required: t('You need to provide a take profit value'),
                min: {
                  value: priceStep,
                  message: t('Take profit cannot be lower than {{value}}', {
                    value: priceStep,
                  }),
                },
                validate: validateAmount(priceStep, 'takeProfit'),
              }}
              render={({ field }) => (
                <TradingInput
                  id="input-order-take-profit"
                  className="w-full"
                  type="number"
                  step={priceStep}
                  min={priceStep}
                  data-testid="order-take-profit"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
                />
              )}
            />
          </TradingFormGroup>
        </div>
        <div className="flex-0 items-center">
          <div className="flex"></div>
          <div className="flex"></div>
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
                required: t('You need to provide a value for stop loss'),
                min: {
                  value: priceStep,
                  message: t('Stop loss cannot be lower than {{value}}', {
                    value: priceStep,
                  }),
                },
                validate: validateAmount(priceStep, 'stopLoss'),
              }}
              render={({ field }) => (
                <TradingInput
                  id="input-order-stop-loss"
                  className="w-full"
                  type="number"
                  step={priceStep}
                  min={priceStep}
                  data-testid="order-stop-loss"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
                />
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
