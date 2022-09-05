import { gql, useQuery } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  Markets,
  Markets_marketsConnection_edges_node,
} from './__generated__';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

export const useMarketList = () => {
  const since = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const { data, loading, error } = useQuery<Markets>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.INTERVAL_I1H, since },
  });

  return {
    data: useMemo(() => data && mapDataToMarketList(data), [data]),
    loading,
    error,
  };
};

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketFields on Market {
    id
    name
    decimalPlaces
    positionDecimalPlaces
    state
    tradingMode
    fees {
      factors {
        makerFee
        infrastructureFee
        liquidityFee
      }
    }
    tradableInstrument {
      instrument {
        id
        name
        code
        metadata {
          tags
        }
        product {
          ... on Future {
            settlementAsset {
              symbol
            }
          }
        }
      }
    }
    marketTimestamps {
      open
      close
    }
  }
`;

export const MARKET_LIST_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query Markets {
    marketsConnection {
      edges {
        node {
          ...MarketFields
        }
      }
    }
  }
`;

const getData = (
  responseData: Markets
): Markets_marketsConnection_edges_node[] | null =>
  responseData.marketsConnection.edges.map((edge) => edge.node);

export const marketsDataProvider = makeDataProvider<
  Markets,
  Markets_marketsConnection_edges_node[],
  never,
  never
>({
  query: MARKET_LIST_QUERY,
  getData,
});
