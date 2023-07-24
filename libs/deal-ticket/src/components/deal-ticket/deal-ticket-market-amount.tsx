import {
  addDecimalsFormatNumber,
  toDecimal,
  validateAmount,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Input, InputError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { isMarketInAuction } from '@vegaprotocol/markets';
import type { DealTicketAmountProps } from './deal-ticket-amount';
import { Controller } from 'react-hook-form';
import classNames from 'classnames';

export type DealTicketMarketAmountProps = Omit<
  DealTicketAmountProps,
  'orderType'
>;

export const DealTicketMarketAmount = ({
  control,
  market,
  marketData,
  marketPrice,
  sizeError,
  update,
  size,
}: DealTicketMarketAmountProps) => {
  const quoteName = market.tradableInstrument.instrument.product.quoteName;
  const sizeStep = toDecimal(market?.positionDecimalPlaces);
  const price = marketPrice;

  const priceFormatted = price
    ? addDecimalsFormatNumber(price, market.decimalPlaces)
    : undefined;

  const inAuction = isMarketInAuction(marketData.marketTradingMode);

  return (
    <div className="mb-2">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="mb-2 text-sm">{t('Size')}</div>
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
        <div className="pt-7 leading-10">@</div>
        <div className="flex-1 text-sm text-right">
          {inAuction && (
            <Tooltip
              description={t(
                'This market is in auction. The uncrossing price is an indication of what the price is expected to be when the auction ends.'
              )}
            >
              <div className="mb-2">{t(`Indicative price`)}</div>
            </Tooltip>
          )}
          <div
            data-testid="last-price"
            className={classNames('leading-10', { 'pt-7': !inAuction })}
          >
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
