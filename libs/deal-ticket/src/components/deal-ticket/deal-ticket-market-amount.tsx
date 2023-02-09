import {
  addDecimalsFormatNumber,
  t,
  toDecimal,
  validateAmount,
} from '@vegaprotocol/react-helpers';
import { Input, NotificationError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { isMarketInAuction } from '../../utils';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { getMarketPrice } from '../../utils/get-price';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  market,
  marketData,
  sizeError,
}: DealTicketMarketAmountProps) => {
  const quoteName = market.tradableInstrument.instrument.product.quoteName;
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const price = getMarketPrice(marketData);

  const priceFormatted = price
    ? addDecimalsFormatNumber(price, market.decimalPlaces)
    : undefined;

  return (
    <div className="mb-6">
      <div className="flex items-end gap-4 mb-2">
        <div className="flex-1 text-sm">Size</div>
        <div />
        <div className="flex-2 text-sm text-right">
          {isMarketInAuction(marketData.marketTradingMode) && (
            <Tooltip
              description={t(
                'This market is in auction. The uncrossing price is an indication of what the price is expected to be when the auction ends.'
              )}
            >
              <div>{t(`Indicative price`)}</div>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
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
              validate: validateAmount(sizeStep, 'Size'),
            })}
          />
        </div>
        <div>@</div>
        <div className="flex-1 text-sm text-right" data-testid="last-price">
          {priceFormatted && quoteName ? (
            <>
              ~{priceFormatted} {quoteName}
            </>
          ) : (
            '-'
          )}
        </div>
      </div>
      {sizeError && (
        <NotificationError
          intent="danger"
          data-testid="dealticket-error-message-size-market"
        >
          {sizeError}
        </NotificationError>
      )}
    </div>
  );
};
