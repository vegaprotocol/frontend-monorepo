import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';

import type {
  LiquidityProvisionMarkets as Markets,
  LiquidityProvisionMarkets_marketsConnection_edges_node as Market,
} from './__generated__';

import { mapDataToMarketList } from './utils';

export const MARKET_LIST_QUERY = gql`
  query LiquidityProvisionMarkets($interval: Interval!, $since: String!) {
    marketsConnection {
      edges {
        node {
          id
          data {
            targetStake
            trigger
          }
          decimalPlaces
          positionDecimalPlaces
          state
          tradingMode
          tradableInstrument {
            instrument {
              name
              code
              product {
                ... on Future {
                  settlementAsset {
                    symbol
                    decimals
                  }
                }
              }
            }
          }
          liquidityProvisionsConnection {
            edges {
              node {
                commitmentAmount
                fee
              }
            }
          }
          candlesConnection(interval: $interval, since: $since) {
            edges {
              node {
                high
                low
                open
                close
                volume
              }
            }
          }
        }
      }
    }
  }
`;

const getData = (responseData: Markets): Market[] | null => {
  return (
    responseData?.marketsConnection?.edges.map((edge) => {
      return edge.node;
    }) || null
  );
};

const marketsProvider = makeDataProvider<Markets, Market[], never, never>({
  query: MARKET_LIST_QUERY,
  getData,
});

export const activeMarketsProvider = makeDerivedDataProvider<Market[], never>(
  [marketsProvider],
  ([markets]) => mapDataToMarketList(markets)
);
