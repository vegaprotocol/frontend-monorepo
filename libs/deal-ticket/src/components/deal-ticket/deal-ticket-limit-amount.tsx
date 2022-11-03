import { FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { validateSize } from '../deal-ticket-validation';
import { DealTicketError } from './deal-ticket-error';
import { DEAL_TICKET_SECTION } from '../constants';

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
                required: true,
                min: sizeStep,
                validate: validateSize(sizeStep),
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
                required: true,
                min: 0,
              })}
            />
          </FormGroup>
        </div>
      </div>
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message-price-limit"
        section={[DEAL_TICKET_SECTION.SIZE, DEAL_TICKET_SECTION.PRICE]}
      />
    </div>
  );
};
