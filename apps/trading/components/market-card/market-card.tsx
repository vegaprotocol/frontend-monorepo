import { EmblemByMarket } from '@vegaprotocol/emblem';
import { useMarket, useSparkline } from '@vegaprotocol/rest';
import { Sparkline, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useChainId } from '@vegaprotocol/wallet-react';

export const MarketCard = ({ marketId }: { marketId: string }) => {
  const { chainId } = useChainId();
  const { data: sparklineData } = useSparkline(marketId);
  const { data: market } = useMarket(marketId);

  if (!market) return null;

  return (
    <div
      key={market.id}
      className="bg-white/50 dark:bg-black/40 flex flex-col items-start gap-4 p-8 rounded-lg"
    >
      <header className="flex justify-between gap-1">
        <div className="flex gap-2 items-start">
          <EmblemByMarket market={market.id} vegaChain={chainId} />
          <div>
            <h4 className="text-2xl">{market.code}</h4>
            <p className="text-sm text-surface-0-fg-muted">{market.name}</p>
          </div>
        </div>
        <div>
          <p className="text-2xl">$72,123</p>
          <p className="flex items-center gap-1">
            <VegaIcon name={VegaIconNames.CHEVRON_UP} /> 16.2%
          </p>
        </div>
      </header>
      <div className="w-full">
        <Sparkline data={sparklineData} className="w-full h-20" />
      </div>
      <dl className="flex justify-between gap-2 w-full">
        <div className="text-left">
          <dt className="text-surface-0-fg-muted text-sm">24h Volume</dt>
          <dd>$40,123</dd>
        </div>
        <div className="text-right">
          <dt className="text-surface-0-fg-muted text-sm">Open interest</dt>
          <dd>$5,682</dd>
        </div>
      </dl>
    </div>
  );
};
