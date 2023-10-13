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

export const Markets = ({
  markets,
}: {
  markets: MarketMaybeWithDataAndCandles[];
}) => {
  return (
    <div>
      <p className="mb-2 text-xs text-muted">{t('Currently traded in')}</p>
      <div className="flex gap-4">
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
  const change = priceChangePercentage(
    oneDayCandles?.map((c) => c.close) || []
  );
  return (
    <div className="flex w-1/4 p-2 rounded gap-2 bg-vega-clight-600 dark:bg-vega-cdark-600">
      <div className="flex-1">
        <h3 className="overflow-hidden text-sm leading-4 whitespace-nowrap text-ellipsis">
          {market.tradableInstrument.instrument.code}
        </h3>

        <p className="font-mono text-xs">{volume}</p>
      </div>
      <div className="flex justify-end w-1/3">
        {oneDayCandles && (
          <Sparkline
            width={60}
            height={20}
            data={oneDayCandles.map((c) => Number(c.close))}
          />
        )}
      </div>
      <div className="w-1/3 font-mono text-xs text-right">
        {market.data?.markPrice && (
          <>
            <div>
              {addDecimalsFormatNumber(
                market.data.markPrice,
                market.decimalPlaces
              )}
            </div>
            <div>{formatNumberPercentage(new BigNumber(change), 2)}</div>
          </>
        )}
      </div>
    </div>
  );
};
