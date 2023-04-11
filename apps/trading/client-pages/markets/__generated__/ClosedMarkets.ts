import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ClosedMarketFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, market: { __typename?: 'Market', id: string } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } };

export type ClosedMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ClosedMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, market: { __typename?: 'Market', id: string } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecBinding: { __typename?: 'DataSourceSpecToFutureBinding', settlementDataProperty: string, tradingTerminationProperty: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open: any, close: any } } }> } | null };

export const ClosedMarketFragmentDoc = gql`
    fragment ClosedMarket on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  data {
    market {
      id
    }
    bestBidPrice
    bestOfferPrice
    markPrice
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
            id
            symbol
            name
            decimals
          }
          quoteName
          dataSourceSpecForTradingTermination {
            id
          }
          dataSourceSpecForSettlementData {
            id
          }
          dataSourceSpecBinding {
            settlementDataProperty
            tradingTerminationProperty
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
export const ClosedMarketsDocument = gql`
    query ClosedMarkets {
  marketsConnection {
    edges {
      node {
        ...ClosedMarket
      }
    }
  }
}
    ${ClosedMarketFragmentDoc}`;

/**
 * __useClosedMarketsQuery__
 *
 * To run a query within a React component, call `useClosedMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useClosedMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useClosedMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useClosedMarketsQuery(baseOptions?: Apollo.QueryHookOptions<ClosedMarketsQuery, ClosedMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ClosedMarketsQuery, ClosedMarketsQueryVariables>(ClosedMarketsDocument, options);
      }
export function useClosedMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ClosedMarketsQuery, ClosedMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ClosedMarketsQuery, ClosedMarketsQueryVariables>(ClosedMarketsDocument, options);
        }
export type ClosedMarketsQueryHookResult = ReturnType<typeof useClosedMarketsQuery>;
export type ClosedMarketsLazyQueryHookResult = ReturnType<typeof useClosedMarketsLazyQuery>;
export type ClosedMarketsQueryResult = Apollo.QueryResult<ClosedMarketsQuery, ClosedMarketsQueryVariables>;