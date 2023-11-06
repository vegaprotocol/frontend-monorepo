import { calcCandleVolume, useCandles } from '@vegaprotocol/markets';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';

export const Markets = ({
  markets,
}: {
  markets: MarketMaybeWithDataAndCandles[];
}) => {
  return (
    <div className="grid grid-cols-4 gap-1 md:gap-4">
      {markets.length ? (
        markets.map((m) => {
          return <MarketCard key={m.id} market={m} />;
        })
      ) : (
        <p className="text-xs">{t('Traded in 0 markets')}</p>
      )}
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

  return (
    <div className="flex flex-col justify-between p-2 text-xs rounded-lg col-span-2 lg:col-span-1 bg-vega-clight-600 dark:bg-vega-cdark-600">
      <h3>{market.tradableInstrument.instrument.code}</h3>
      <p className="text-muted">Vol {volume}</p>
    </div>
  );
};
