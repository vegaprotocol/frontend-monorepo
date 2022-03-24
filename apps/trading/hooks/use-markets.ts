import { gql, useApolloClient } from '@apollo/client';
import {
  Markets,
  Markets_markets,
  MarketDataSub,
  MarketDataSub_marketData,
} from '@vegaprotocol/graphql';
import { useCallback, useEffect, useState } from 'react';

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketDataFields on MarketData {
    market {
      id
      state
      tradingMode
    }
    bestBidPrice
    bestOfferPrice
    markPrice
  }
`;

const MARKETS_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query Markets {
    markets {
      id
      name
      decimalPlaces
      data {
        ...MarketDataFields
      }
      tradableInstrument {
        instrument {
          code
          product {
            ... on Future {
              settlementAsset {
                symbol
              }
            }
          }
        }
      }
    }
  }
`;

const MARKET_DATA_SUB = gql`
  ${MARKET_DATA_FRAGMENT}
  subscription MarketDataSub {
    marketData {
      ...MarketDataFields
    }
  }
`;

interface UseMarkets {
  markets: Markets_markets[];
  error: Error | null;
  loading: boolean;
}

export const useMarkets = (): UseMarkets => {
  const client = useApolloClient();
  const [markets, setMarkets] = useState<Markets_markets[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const mergeMarketData = useCallback((update: MarketDataSub_marketData) => {
    setMarkets((curr) => {
      return curr.map((m) => {
        if (update.market.id === m.id) {
          return {
            ...m,
            data: update,
          };
        }

        return m;
      });
    });
  }, []);

  // Make initial fetch
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        const res = await client.query<Markets>({
          query: MARKETS_QUERY,
        });

        if (!res.data.markets?.length) return;

        setMarkets(res.data.markets);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mergeMarketData, client]);

  // Start subscription
  useEffect(() => {
    const sub = client
      // This data callback will unfortunately be called separately with an update for every market,
      // perhaps we should batch this somehow...
      .subscribe<MarketDataSub>({
        query: MARKET_DATA_SUB,
      })
      .subscribe(({ data }) => {
        mergeMarketData(data.marketData);
      });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [client, mergeMarketData]);

  return { markets, error, loading };
};
