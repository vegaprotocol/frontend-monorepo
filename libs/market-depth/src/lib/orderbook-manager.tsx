import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketDepthProvider } from './market-depth-provider';
import { marketDataProvider, marketProvider } from '@vegaprotocol/markets';
import type {
  MarketDepthQuery,
  MarketDepthQueryVariables,
  MarketDepthUpdateSubscription,
  PriceLevelFieldsFragment,
} from './__generated__/MarketDepth';
import { useOrderStore } from '@vegaprotocol/orders';

export type OrderbookData = {
  asks: PriceLevelFieldsFragment[];
  bids: PriceLevelFieldsFragment[];
};

interface OrderbookManagerProps {
  marketId: string;
}

export const OrderbookManager = ({ marketId }: OrderbookManagerProps) => {
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

  const updateOrder = useOrderStore((store) => store.update);

  return (
    <AsyncRenderer
      loading={loading || marketDataLoading || marketLoading}
      error={error || marketDataError || marketError}
      data={data}
      reload={reload}
    >
      <Orderbook
        bids={data?.depth.buy ?? []}
        asks={data?.depth.sell ?? []}
        decimalPlaces={market?.decimalPlaces ?? 0}
        positionDecimalPlaces={market?.positionDecimalPlaces ?? 0}
        onClick={(price: string) => {
          if (price) {
            updateOrder(marketId, { price });
          }
        }}
        midPrice={marketData?.midPrice}
      />
    </AsyncRenderer>
  );
};
