import { Controller, type Control } from 'react-hook-form';
import type { Market } from '@vegaprotocol/markets';
import type { OrderFormValues } from '../../hooks/use-form-values';
import { toDecimal, validateAmount } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  FormGroup,
  Input,
  InputError,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

export interface DealTicketSizeIcebergProps {
  control: Control<OrderFormValues & { summary: undefined }>;
  market: Market;
  peakSizeError?: string;
  minimumVisibleSizeError?: string;
  size: string;
  peakSize?: string;
}

export const DealTicketSizeIceberg = ({
  control,
  market,
  peakSizeError,
  minimumVisibleSizeError,
  size,
  peakSize,
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
                      'The maximum volume that can be traded at once. Must be less than the total size of the order.'
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
                  message: t(
                    'Peak size cannot be greater than the size (%s) ',
                    [size]
                  ),
                },
                validate: validateAmount(sizeStep, 'peakSize'),
              }}
              render={({ field }) => (
                <Input
                  id="input-order-peak-size"
                  className="w-full"
                  type="number"
                  step={sizeStep}
                  min={sizeStep}
                  max={size}
                  data-testid="order-peak-size"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
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
                      'When the order trades and its size falls below this threshold, it will be reset to the peak size and moved to the back of the priority order. Must be less than or equal to peak size, and greater than 0.'
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
                max: peakSize && {
                  value: peakSize,
                  message: t(
                    'Minimum visible size cannot be greater than the peak size (%s)',
                    [peakSize]
                  ),
                },
                validate: validateAmount(sizeStep, 'minimumVisibleSize'),
              }}
              render={({ field }) => (
                <Input
                  id="input-order-minimum-size"
                  className="w-full"
                  type="number"
                  step={sizeStep}
                  min={sizeStep}
                  max={peakSize}
                  data-testid="order-minimum-size"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...field}
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
