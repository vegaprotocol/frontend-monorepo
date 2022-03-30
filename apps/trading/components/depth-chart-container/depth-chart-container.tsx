import 'pennant/dist/style.css';

import { gql, useQuery } from '@apollo/client';
import { DepthChart } from 'pennant';
import { Splash } from '@vegaprotocol/ui-toolkit';
import { addDecimal } from '@vegaprotocol/react-helpers';

const MARKET_DEPTH_QUERY = gql`
  query Market($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      state
      tradingMode
      tradableInstrument {
        instrument {
          product {
            ... on Future {
              quoteName
              settlementAsset {
                id
                symbol
                name
              }
            }
          }
        }
      }
      data {
        market {
          id
        }
        midPrice
        indicativePrice
      }
      depth {
        buy {
          price
          volume
          numberOfOrders
        }
        sell {
          price
          volume
          numberOfOrders
        }
        lastTrade {
          price
        }
        sequenceNumber
      }
    }
  }
`;

export type DepthChartContainerProps = {
  marketId: string;
};

export const DepthChartContainer = ({ marketId }: DepthChartContainerProps) => {
  const { data, loading, error } = useQuery(MARKET_DEPTH_QUERY, {
    pollInterval: 5000,
    variables: { marketId },
  });

  if (error) {
    return <Splash>Error</Splash>;
  }

  if (loading) {
    return <Splash>Loading...</Splash>;
  }

  return (
    <DepthChart
      data={{
        buy:
          data.market.depth.buy?.map((priceLevel) => ({
            price: +addDecimal(priceLevel.price, data.market.decimalPlaces),
            volume: +priceLevel.volume,
          })) ?? [],
        sell:
          data.market.depth.sell?.map((priceLevel) => ({
            price: +addDecimal(priceLevel.price, data.market.decimalPlaces),
            volume: +priceLevel.volume,
          })) ?? [],
      }}
      indicativePrice={
        +addDecimal(data.market.data.indicativePrice, data.market.decimalPlaces)
      }
      midPrice={
        +addDecimal(data.market.data.midPrice, data.market.decimalPlaces)
      }
    />
  );
};
