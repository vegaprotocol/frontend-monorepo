import { useParams } from 'react-router-dom';
import { t } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import {
  useLiquidityProvision,
  getFeeLevels,
  sumLiquidityCommitted,
} from '@vegaprotocol/liquidity';

import { Market } from './Market';
import { Header } from './header';
import { Providers } from './providers';

const useMarketDetails = (marketId: string | undefined) => {
  const { data, error, loading } = useLiquidityProvision({ marketId });

  return {
    data: {
      ...data,
      targetStake: data.targetStake || '0',
      feeLevels: getFeeLevels(data.liquidityProviders) || [],
      comittedLiquidity: sumLiquidityCommitted(data.liquidityProviders) || 0,
      settlementAsset: {
        symbol: data.symbol,
        decimals: data.decimalPlaces,
      },
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
      <div className="px-16 pt-14 pb-12 bg-[#F0F0F0]">
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
            <Providers
              liquidityProviders={data.liquidityProviders}
              settlementAsset={data.settlementAsset}
            />
          </div>
        </div>
      </div>
    </AsyncRenderer>
  );
};
