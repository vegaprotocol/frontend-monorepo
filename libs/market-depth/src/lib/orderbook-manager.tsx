import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Orderbook } from './orderbook';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketDepthProvider } from './market-depth-provider';
import { isMarketInAuction } from '@vegaprotocol/markets';
import {
  type MarketDepthQuery,
  type MarketDepthQueryVariables,
  type MarketDepthUpdateSubscription,
} from './__generated__/MarketDepth';
import { type MarketTradingMode } from '@vegaprotocol/types';

interface OrderbookManagerProps {
  market: {
    id: string;
    decimalPlaces: number;
    positionDecimalPlaces: number;
    data?: {
      lastTradedPrice: string;
      indicativePrice: string;
      marketTradingMode: MarketTradingMode;
    };
  };
  quoteName: string;
  onClick: (args: { price?: string; size?: string }) => void;
}

export const OrderbookManager = ({
  market,
  quoteName,
  onClick,
}: OrderbookManagerProps) => {
  const { data, error, loading, reload } = useDataProvider<
    MarketDepthQuery['market'] | undefined,
    MarketDepthUpdateSubscription['marketsDepthUpdate'] | null,
    MarketDepthQueryVariables
  >({
    dataProvider: marketDepthProvider,
    variables: { marketId: market.id },
  });

  return (
    <AsyncRenderer loading={loading} error={error} data={data} reload={reload}>
      {market && (
        <Orderbook
          bids={data?.depth.buy ?? []}
          asks={data?.depth.sell ?? []}
          decimalPlaces={market.decimalPlaces}
          positionDecimalPlaces={market.positionDecimalPlaces}
          assetSymbol={quoteName}
          onClick={onClick}
          lastTradedPrice={market.data.lastTradedPrice}
          indicativePrice={market.data.indicativePrice}
          isMarketInAuction={isMarketInAuction(market.data.marketTradingMode)}
        />
      )}
    </AsyncRenderer>
  );
};
