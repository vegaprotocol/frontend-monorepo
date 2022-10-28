import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import {
  t,
  useDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import {
  getFeeLevels,
  sumLiquidityCommitted,
  marketLiquidityDataProvider,
  liquidityProvisionsDataProvider,
} from '@vegaprotocol/liquidity';
import type { MarketLpQuery } from '@vegaprotocol/liquidity';

import { Market } from './market';
import { Header } from './header';
import { LPProvidersGrid } from './providers';

const formatMarket = (data: MarketLpQuery) => {
  return {
    name: data?.market?.tradableInstrument.instrument.name,
    symbol:
      data?.market?.tradableInstrument.instrument.product.settlementAsset
        .symbol,
    settlementAsset:
      data?.market?.tradableInstrument.instrument.product.settlementAsset,
    targetStake: data?.market?.data?.targetStake,
    tradingMode: data?.market?.data?.marketTradingMode,
    trigger: data?.market?.data?.trigger,
  };
};

export const lpDataProvider = makeDerivedDataProvider(
  [marketLiquidityDataProvider, liquidityProvisionsDataProvider],
  ([market, providers]) => ({
    market: { ...formatMarket(market) },
    liquidityProviders: providers || [],
  })
);

const useMarketDetails = (marketId: string | undefined) => {
  const { data, loading, error } = useDataProvider({
    dataProvider: lpDataProvider,
    noUpdate: true,
    variables: useMemo(() => ({ marketId }), [marketId]),
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

export const Detail = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const { data, loading, error } = useMarketDetails(marketId);

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className="px-16 pt-14 pb-12 bg-greys-light-100">
        <div className="max-w-screen-xl mx-auto">
          <Header name={data.name} symbol={data.symbol} />
        </div>
      </div>
      <div className="px-16">
        <div className="max-w-screen-xl mx-auto">
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
            <h2 className="font-alpha text-2xl mb-4">
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
