import {
  addDecimalsFormatNumber,
  t,
  toDecimal,
} from '@vegaprotocol/react-helpers';
import { Input, InputError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { isMarketInAuction, validateAmount } from '../../utils';

import type { DealTicketAmountProps } from './deal-ticket-amount';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  register,
  market,
  sizeError,
}: DealTicketMarketAmountProps) => {
  const quoteName =
    market.tradableInstrument.instrument.product.settlementAsset.symbol;
  const sizeStep = toDecimal(market?.positionDecimalPlaces);

  let price;
  if (isMarketInAuction(market)) {
    // 0 can never be a valid uncrossing price
    // as it would require there being orders on the book at that price.
    if (
      market.data?.indicativePrice &&
      market.data.indicativePrice !== '0' &&
      BigInt(market.data?.indicativePrice) !== BigInt(0)
    ) {
      price = market.data.indicativePrice;
    }
  } else {
    price = market.depth.lastTrade?.price;
  }

  const priceFormatted = price
    ? addDecimalsFormatNumber(price, market.decimalPlaces)
    : undefined;

  return (
    <div className="mb-6">
      <div className="flex items-end gap-4 mb-2">
        <div className="flex-1 text-sm">Size</div>
        <div />
        <div className="flex-1 text-sm text-right">
          {isMarketInAuction(market) && (
            <Tooltip
              description={t(
                'This market is in auction. The uncrossing price is an indication of what the price is expected to be when the auction ends.'
              )}
            >
              <div>{t(`Estimated uncrossing price`)}</div>
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
        <InputError
          intent="danger"
          data-testid="dealticket-error-message-size-market"
        >
          {sizeError}
        </InputError>
      )}
    </div>
  );
};
