import { formatNumber, t, toDecimal } from '@vegaprotocol/react-helpers';
import {
  FormGroup,
  Input,
  InputError,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

import { isMarketInAuction } from '../deal-ticket-validation/use-order-validation';
import { validateAmount } from '../deal-ticket-validation/validate-amount';

import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  price,
  market,
  quoteName,
  sizeError,
}: DealTicketMarketAmountProps) => {
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 relative">
        <div className="flex-1">
          <FormGroup
            label={t('Size')}
            labelFor="input-order-size-market"
            className="!mb-1"
          >
            <Input
              id="input-order-size-market"
              className="w-full"
              type="number"
              step={sizeStep}
              min={sizeStep}
              onWheel={(e) => e.currentTarget.blur()}
              data-testid="order-size"
              {...register('size', {
                required: t('You need to provide a size'),
                min: {
                  value: sizeStep,
                  message: t('Size cannot be lower than ' + sizeStep),
                },
                validate: validateAmount(sizeStep, 'size'),
              })}
            />
          </FormGroup>
        </div>
        <div className="flex-0 items-center">
          <div className="flex">&nbsp;</div>
          <div className="flex">@</div>
        </div>
        <div className="flex-1" data-testid="last-price">
          {isMarketInAuction(market) ? (
            <Tooltip
              description={t(
                'This market is in auction. The uncrossing price is an indication of what the price is expected to be when the auction ends.'
              )}
            >
              <div className="absolute top-0 right-0 text-xs">
                {t(`Estimated uncrossing price`)}
              </div>
            </Tooltip>
          ) : (
            <div>&nbsp;</div>
          )}
          <div className="text-sm text-right">
            {price && quoteName ? (
              <>
                ~{formatNumber(price, market.decimalPlaces)} {quoteName}
              </>
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>
      {sizeError && (
        <InputError intent="danger" data-testid="deal-ticket-error-message">
          {sizeError}
        </InputError>
      )}
      {/* <DealTicketError
        errorMessage={error}
        data-testid="dealticket-error-message-price-market"
        section={[DEAL_TICKET_SECTION.SIZE, DEAL_TICKET_SECTION.PRICE]}
      /> */}
    </div>
  );
};
