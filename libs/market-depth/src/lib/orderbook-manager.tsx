import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketDepthProvider } from './market-depth-provider';
import {
  getQuoteName,
  marketDataProvider,
  marketProvider,
} from '@vegaprotocol/markets';
import type {
  MarketDepthQuery,
  MarketDepthQueryVariables,
  MarketDepthUpdateSubscription,
} from './__generated__/MarketDepth';

interface OrderbookManagerProps {
  marketId: string;
  onClick: (args: { price?: string; size?: string }) => void;
}

export const OrderbookManager = ({
  marketId,
  onClick,
}: OrderbookManagerProps) => {
  const variables = { marketId };

  const { data, error, loading, reload } = useDataProvider<
    MarketDepthQuery['market'] | undefined,
    MarketDepthUpdateSubscription['marketsDepthUpdate'] | null,
    MarketDepthQueryVariables
  >({
    dataProvider: marketDepthProvider,
    variables,
  });

  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketProvider,
    skipUpdates: true,
    variables,
  });

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
  } = useDataProvider({
    dataProvider: marketDataProvider,
    variables,
  });
  return (
    <AsyncRenderer
      loading={loading || marketDataLoading || marketLoading}
      error={error || marketDataError || marketError}
      data={data}
      reload={reload}
    >
      {market && marketData && (
        <Orderbook
          bids={data?.depth.buy ?? []}
          asks={data?.depth.sell ?? []}
          decimalPlaces={market.decimalPlaces}
          positionDecimalPlaces={market.positionDecimalPlaces}
          assetSymbol={getQuoteName(market)}
          onClick={onClick}
          lastTradedPrice={marketData.lastTradedPrice}
        />
      )}
    </AsyncRenderer>
  );
};
