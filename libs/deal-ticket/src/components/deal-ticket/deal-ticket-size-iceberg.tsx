import { Controller, type Control } from 'react-hook-form';
import type { Market } from '@vegaprotocol/markets';
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
  peakSizeError?: string;
  minimumVisibleSizeError?: string;
  update: (obj: Partial<OrderObj>) => void;
  peakSize: string;
  minimumVisibleSize: string;
  size: string;
}

export const DealTicketSizeIceberg = ({
  control,
  market,
  update,
  peakSizeError,
  minimumVisibleSizeError,
  peakSize,
  minimumVisibleSize,
  size,
}: DealTicketSizeIcebergProps) => {
  const sizeStep = toDecimal(market?.positionDecimalPlaces);

  const renderPeakSizeError = () => {
    if (peakSizeError) {
      return (
        <InputError testId="deal-ticket-peak-error-message-size-limit">
          {peakSizeError}
        </InputError>
      );
    }

    return null;
  };

  const renderMinimumSizeError = () => {
    if (minimumVisibleSizeError) {
      return (
        <InputError testId="deal-ticket-minimum-error-message-size-limit">
          {minimumVisibleSizeError}
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
                <span className="text-xs">{t('Peak size')}</span>
              </Tooltip>
            }
            labelFor="input-order-peak-size"
            className="!mb-1"
          >
            <Controller
              name="icebergOpts.peakSize"
              control={control}
              rules={{
                required: t('You need to provide a peak size'),
                min: {
                  value: sizeStep,
                  message: t('Peak size cannot be lower than ' + sizeStep),
                },
                max: {
                  value: size,
                  message: t('Peak size cannot be greater than ' + size),
                },
                validate: validateAmount(sizeStep, 'peakSize'),
              }}
              render={() => (
                <Input
                  id="input-order-peak-size"
                  className="w-full"
                  type="number"
                  value={peakSize}
                  onChange={(e) =>
                    update({
                      icebergOpts: {
                        peakSize: e.target.value,
                        minimumVisibleSize,
                      },
                    })
                  }
                  step={sizeStep}
                  min={sizeStep}
                  max={size}
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
            label={
              <Tooltip
                description={
                  <div>
                    {t(
                      'When the order trades and its size falls below this threshold, it will be reset to the peak size and moved to the back of the priority order. Must be less than peak size.'
                    )}
                  </div>
                }
              >
                <span className="text-xs">{t('Minimum size')}</span>
              </Tooltip>
            }
            labelFor="input-order-minimum-size"
            className="!mb-1"
          >
            <Controller
              name="icebergOpts.minimumVisibleSize"
              control={control}
              rules={{
                required: t('You need to provide a minimum visible size'),
                min: {
                  value: sizeStep,
                  message: t(
                    'Minimum visible size cannot be lower than ' + sizeStep
                  ),
                },
                max: {
                  value: peakSize,
                  message: t(
                    'Minimum visible size cannot be greater than ' + peakSize
                  ),
                },
                validate: validateAmount(sizeStep, 'minimumVisibleSize'),
              }}
              render={() => (
                <Input
                  id="input-order-minimum-size"
                  className="w-full"
                  type="number"
                  value={minimumVisibleSize}
                  onChange={(e) =>
                    update({
                      icebergOpts: {
                        peakSize,
                        minimumVisibleSize: e.target.value,
                      },
                    })
                  }
                  step={sizeStep}
                  min={sizeStep}
                  max={peakSize}
                  data-testid="order-minimum-size"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              )}
            />
          </FormGroup>
        </div>
      </div>
      {renderPeakSizeError()}
      {renderMinimumSizeError()}
    </div>
  );
};
