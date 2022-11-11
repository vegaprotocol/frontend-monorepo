import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  t,
  toDecimal,
} from '@vegaprotocol/react-helpers';
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
            {priceFormatted && quoteName ? (
              <>
                ~{priceFormatted} {quoteName}
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
    </div>
  );
};
