import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useOrderbook } from './market-depth-provider';
import {
  getQuoteName,
  isMarketInAuction,
  marketDataProvider,
  marketProvider,
} from '@vegaprotocol/markets';

interface OrderbookManagerProps {
  marketId: string;
  onClick: (args: { price?: string; size?: string }) => void;
}

export const OrderbookManager = ({
  marketId,
  onClick,
}: OrderbookManagerProps) => {
  const { data, error, loading, reload } = useOrderbook(marketId);

  const {
    data: market,
    error: marketError,
    loading: marketLoading,
  } = useDataProvider({
    dataProvider: marketProvider,
    skipUpdates: true,
    variables: { marketId },
  });

  const {
    data: marketData,
    error: marketDataError,
    loading: marketDataLoading,
  } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
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
          indicativePrice={marketData.indicativePrice}
          isMarketInAuction={isMarketInAuction(marketData.marketTradingMode)}
        />
      )}
    </AsyncRenderer>
  );
};
