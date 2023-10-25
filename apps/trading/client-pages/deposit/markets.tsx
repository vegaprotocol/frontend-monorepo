import { calcCandleVolume, useCandles } from '@vegaprotocol/markets';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { Sparkline } from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumberPercentage,
  priceChangePercentage,
} from '@vegaprotocol/utils';
import { BigNumber } from 'bignumber.js';
import { t } from '@vegaprotocol/i18n';
import classNames from 'classnames';

export const Markets = ({
  markets,
}: {
  markets: MarketMaybeWithDataAndCandles[];
}) => {
  return (
    <div>
      <p className="mb-2 text-xs text-muted">{t('Currently traded in')}</p>
      <div className="grid grid-cols-4 gap-1 md:gap-4">
        {markets.length ? (
          markets.map((m) => {
            return <MarketCard key={m.id} market={m} />;
          })
        ) : (
          <p className="text-xs">No markets</p>
        )}
      </div>
    </div>
  );
};

const MarketCard = ({ market }: { market: MarketMaybeWithDataAndCandles }) => {
  const { oneDayCandles } = useCandles({ marketId: market.id });
  const vol = oneDayCandles ? calcCandleVolume(oneDayCandles) : '0';
  const volume =
    vol && vol !== '0'
      ? addDecimalsFormatNumber(vol, market.positionDecimalPlaces)
      : '0.00';
  const change = new BigNumber(
    priceChangePercentage(oneDayCandles?.map((c) => c.close) || [])
  );

  return (
    <div className="flex flex-col p-2 rounded-lg md:p-4 col-span-2 lg:col-span-1 gap-1 lg:gap-2 bg-vega-clight-600 dark:bg-vega-cdark-600">
      <div className="text-sm lg:text-base">
        <h3 className="leading-none">
          {market.tradableInstrument.instrument.code}
        </h3>
        <p className="text-muted">Vol {volume}</p>
      </div>
      <div className="items-end justify-between hidden md:flex gap-2 lg:gap-8">
        <div>
          {market.data?.markPrice && (
            <>
              <p className="text-sm leading-none lg:text-base">
                {addDecimalsFormatNumber(
                  market.data.markPrice,
                  market.decimalPlaces
                )}
              </p>
              <p
                className={classNames(
                  'text-xs lg:text-sm leading-tight align-baseline',
                  {
                    'text-market-green': change.isGreaterThan(0),
                    'text-market-red': change.isLessThan(0),
                    'text-muted': change.isZero(),
                  }
                )}
              >
                {formatNumberPercentage(change, 2)}
              </p>
            </>
          )}
        </div>
        <div className="flex-1 max-w-[50%]">
          {oneDayCandles && (
            <Sparkline
              width="100%"
              height={36}
              data={oneDayCandles.map((c) => Number(c.close))}
            />
          )}
        </div>
      </div>
    </div>
  );
};
