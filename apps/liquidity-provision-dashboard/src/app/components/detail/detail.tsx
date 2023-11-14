import { useParams } from 'react-router-dom';
import { makeDerivedDataProvider } from '@vegaprotocol/data-provider';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import {
  getFeeLevels,
  sumLiquidityCommitted,
  lpAggregatedDataProvider,
} from '@vegaprotocol/liquidity';
import { getAsset, marketWithDataProvider } from '@vegaprotocol/markets';
import type { MarketWithData } from '@vegaprotocol/markets';

import { Market } from './market';
import { Header } from './header';
import { LPProvidersGrid } from './providers';

const formatMarket = (market: MarketWithData) => {
  return {
    name: market?.tradableInstrument.instrument.name,
    symbol: getAsset(market).symbol,
    settlementAsset: getAsset(market),
    targetStake: market?.data?.targetStake,
    tradingMode: market?.data?.marketTradingMode,
    trigger: market?.data?.trigger,
  };
};

export const lpDataProvider = makeDerivedDataProvider(
  [marketWithDataProvider, lpAggregatedDataProvider],
  ([market, lpAggregatedData]) => ({
    market: { ...formatMarket(market) },
    liquidityProviders: lpAggregatedData || [],
  })
);

const useMarketDetails = (marketId: string | undefined) => {
  const { data, loading, error } = useDataProvider({
    dataProvider: lpDataProvider,
    skipUpdates: true,
    variables: { marketId: marketId || '' },
  });

  const liquidityProviders = data?.liquidityProviders || [];

  return {
    data: {
      name: data?.market?.name,
      symbol: data?.market?.symbol,
      liquidityProviders: liquidityProviders,
      feeLevels: getFeeLevels(liquidityProviders),
      comittedLiquidity: sumLiquidityCommitted(liquidityProviders) || 0,
      settlementAsset: data?.market?.settlementAsset || {},
      targetStake: data?.market?.targetStake || '0',
      tradingMode: data?.market.tradingMode,
    },
    error,
    loading: loading,
  };
};

type Params = { marketId: string };

export const Detail = () => {
  const { marketId } = useParams<Params>();
  const { data, loading, error } = useMarketDetails(marketId);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className="bg-greys-light-100 px-16 pb-12 pt-14">
        <div className="mx-auto max-w-screen-xl">
          <Header name={data.name} symbol={data.symbol} />
        </div>
      </div>
      <div className="px-16">
        <div className="mx-auto max-w-screen-xl">
          <div className="py-12">
            {marketId && (
              <Market
                marketId={marketId}
                feeLevels={data.feeLevels}
                comittedLiquidity={data.comittedLiquidity}
                settlementAsset={data.settlementAsset}
                targetStake={data.targetStake}
                tradingMode={data.tradingMode}
              />
            )}
          </div>
          <div>
            <h2 className="font-alpha calt mb-4 text-2xl">
              {t('Current Liquidity Provision')}
            </h2>
            <LPProvidersGrid
              liquidityProviders={data.liquidityProviders}
              settlementAsset={data.settlementAsset}
            />
          </div>
        </div>
      </div>
    </AsyncRenderer>
  );
};
