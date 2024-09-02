import { EmblemByAsset } from '@vegaprotocol/emblem';
import { useMarket, useMarketData, useCandleData } from '@vegaprotocol/rest';
import {
  cn,
  Sparkline,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useChainId } from '@vegaprotocol/wallet-react';

export const MarketCard = ({ marketId }: { marketId: string }) => {
  const { chainId } = useChainId();
  const { data: market } = useMarket(marketId);
  const { data: marketData } = useMarketData(marketId);
  const { sparkline, volume, priceChange, pctChange } = useCandleData(marketId);

  if (!market) return null;

  return (
    <div
      key={market.id}
      className="bg-black/5 dark:bg-black/40 border flex flex-col items-start gap-4 p-6 rounded-lg"
    >
      <header className="flex justify-between gap-2 w-full">
        <div className="flex gap-2 items-start min-w-0">
          <EmblemByAsset
            vegaChain={chainId}
            asset={market.quoteAsset.id}
            size={34}
          />
          <div className="min-w-0">
            <h4 className="text-2xl leading-none truncate">{market.code}</h4>
            <p className="text-sm leading-none text-surface-0-fg-muted truncate">
              {market.name}
            </p>
          </div>
        </div>
        <div>
          <p className="text-2xl leading-none">
            {marketData?.markPrice.toFormat()}
          </p>
          {priceChange && (
            <p
              className={cn('text-sm flex items-center justify-end gap-1', {
                'text-dir-up-fg': priceChange?.isPositive(),
                'text-dir-down-fg': priceChange?.isNegative(),
              })}
            >
              <VegaIcon
                size={10}
                name={
                  priceChange?.isPositive()
                    ? VegaIconNames.CHEVRON_UP
                    : VegaIconNames.CHEVRON_DOWN
                }
              />{' '}
              {pctChange?.toFixed(2)}%
            </p>
          )}
        </div>
      </header>
      <div className="w-full h-10">
        {sparkline && <Sparkline data={sparkline} className="w-full h-10" />}
      </div>
      <dl className="flex justify-between gap-2 w-full">
        <div className="text-left">
          <dt className="text-surface-0-fg-muted text-sm">24h Volume</dt>
          <dd>{volume?.toFormat()}</dd>
        </div>
        <div className="text-right">
          <dt className="text-surface-0-fg-muted text-sm">Open interest</dt>
          <dd>{marketData?.openInterest.toFormat()}</dd>
        </div>
      </dl>
    </div>
  );
};
