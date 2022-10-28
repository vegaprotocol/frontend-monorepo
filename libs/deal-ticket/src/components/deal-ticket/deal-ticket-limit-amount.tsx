import classNames from 'classnames';
import { FormGroup, Input, InputError } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { validateSize } from '../deal-ticket-validation';

export type DealTicketLimitAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketLimitAmount = ({
  register,
  market,
  quoteName,
  errorMessage,
}: DealTicketLimitAmountProps) => {
  const priceStep = toDecimal(market?.decimalPlaces);
  const sizeStep = toDecimal(market?.positionDecimalPlaces);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FormGroup
            label={t('Size')}
            labelFor="input-order-size-limit"
            className={classNames({
              '!mb-1': errorMessage,
            })}
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
                required: true,
                min: sizeStep,
                validate: validateSize(sizeStep),
              })}
            />
          </FormGroup>
        </div>
        <div>@</div>
        <div className="flex-1">
          <FormGroup
            labelFor="input-price-quote"
            label={t(`Price (${quoteName})`)}
            labelAlign="right"
            className={classNames({
              '!mb-1': errorMessage,
            })}
          >
            <Input
              id="input-price-quote"
              className="w-full"
              type="number"
              step={priceStep}
              data-testid="order-price"
              onWheel={(e) => e.currentTarget.blur()}
              {...register('price', {
                required: true,
                min: 0,
              })}
            />
          </FormGroup>
        </div>
      </div>
      {errorMessage && (
        <div className="mb-6 -mt-2">
          <InputError
            intent={errorMessage.isDisabled ? 'danger' : 'warning'}
            data-testid="dealticket-error-message-price-limit"
          >
            {errorMessage.message}
          </InputError>
        </div>
      )}
    </>
  );
};
