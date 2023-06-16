import {
  addDecimalsFormatNumber,
  toDecimal,
  validateAmount,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Input, InputError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { isMarketInAuction } from '../../utils';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { getMarketPrice } from '../../utils/get-price';
import { Controller } from 'react-hook-form';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  control,
  market,
  marketData,
  sizeError,
  update,
  size,
}: DealTicketMarketAmountProps) => {
  const quoteName = market.tradableInstrument.instrument.product.quoteName;
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const price = getMarketPrice(marketData);

  const priceFormatted = price
    ? addDecimalsFormatNumber(price, market.decimalPlaces)
    : undefined;

  return (
    <div className="mb-2">
      <div className="flex items-end gap-4 mb-2">
        <div className="flex-1 text-sm">{t('Size')}</div>
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
                id="input-order-size-market"
                className="w-full"
                type="number"
                value={size}
                onChange={(e) => update({ size: e.target.value })}
                step={sizeStep}
                min={sizeStep}
                onWheel={(e) => e.currentTarget.blur()}
                data-testid="order-size"
              />
            )}
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
          testId="deal-ticket-error-message-size-market"
        >
          {sizeError}
        </InputError>
      )}
    </div>
  );
};
