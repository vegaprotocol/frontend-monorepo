import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';

export const Markets = ({
  markets,
}: {
  markets: MarketMaybeWithDataAndCandles[];
}) => {
  return (
    <div className="flex gap-2">
      {markets.length ? (
        markets.map((m) => {
          return (
            <div
              key={m.id}
              className="flex w-1/4 px-2 py-1 text-xs rounded gap-2 bg-vega-clight-700"
            >
              {m.tradableInstrument.instrument.code} {m.data?.markPrice}
            </div>
          );
        })
      ) : (
        <p className="text-xs">No markets</p>
      )}
    </div>
  );
};
