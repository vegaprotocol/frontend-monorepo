import { Controller, type Control } from 'react-hook-form';
import type { Market, MarketData } from '@vegaprotocol/markets';
import type * as Schema from '@vegaprotocol/types';
import type { OrderObj } from '@vegaprotocol/orders';
import type { OrderFormFields } from '../../hooks/use-order-form';
import { toDecimal, validateAmount } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  FormGroup,
  Input,
  InputError,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

export interface DealTicketSizeIcebergProps {
  control: Control<OrderFormFields>;
  market: Market;
  sizeError?: string;
  update: (obj: Partial<OrderObj>) => void;
  size: string;
}

export const DealTicketSizeIceberg = ({
  control,
  market,
  sizeError,
  update,
  size,
}: DealTicketSizeIcebergProps) => {
  const sizeStep = toDecimal(market?.positionDecimalPlaces);

  const renderError = () => {
    if (sizeError) {
      return (
        <InputError testId="deal-ticket-error-message-size-limit">
          {sizeError}
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
            label={
              <Tooltip
                description={
                  <div>
                    {t(
                      'The maximum amount of volume that can be traded at once. Must be less than the total size of the order.'
                    )}
                  </div>
                }
              >
                <span>{t('Peak Size')}</span>
              </Tooltip>
            }
            labelFor="input-order-peak-size"
            className="!mb-1"
          >
            <Controller
              name="icebergOpts.peakSize"
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
                  id="input-order-peak-size"
                  className="w-full"
                  type="number"
                  value={size}
                  onChange={(e) => update({ size: e.target.value })}
                  step={sizeStep}
                  min={sizeStep}
                  data-testid="order-peak-size"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              )}
            />
          </FormGroup>
        </div>
        <div className="flex-0 items-center">
          <div className="flex"></div>
          <div className="flex"></div>
        </div>
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
      </div>
      {renderError()}
    </div>
  );
};
