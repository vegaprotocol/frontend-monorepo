import { FormGroup, Input, Tooltip } from '@vegaprotocol/ui-toolkit';
import { t, toDecimal } from '@vegaprotocol/react-helpers';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { validateSize } from '../deal-ticket-validation/validate-size';
import { isMarketInAuction } from './deal-ticket';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  price,
  market,
  quoteName,
}: DealTicketMarketAmountProps) => {
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <FormGroup label={t('Size')} labelFor="input-order-size-market">
          <Input
            id="input-order-size-market"
            className="w-full"
            type="number"
            step={sizeStep}
            min={sizeStep}
            data-testid="order-size"
            {...register('size', {
              required: true,
              min: sizeStep,
              validate: validateSize(sizeStep),
            })}
          />
        </FormGroup>
      </div>
      <div>@</div>
      <div className="flex-1" data-testid="last-price">
        {isMarketInAuction(market) && (
          <Tooltip
            description={t(
              'This market is in auction. The uncrossing price is an indication of what the price is expected to be when the auction ends.'
            )}
          >
            <span className={'block mb-2 text-sm text-left'}>
              {t(`Estimated uncrossing price`)}
            </span>
          </Tooltip>
        )}
        <span className="text-sm">
          {price && quoteName ? (
            <>
              ~{price} {quoteName}
            </>
          ) : (
            '-'
          )}
        </span>
      </div>
    </div>
  );
};
