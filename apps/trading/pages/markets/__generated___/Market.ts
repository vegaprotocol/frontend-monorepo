import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, tradingMode: Types.MarketTradingMode, state: Types.MarketState, decimalPlaces: number, positionDecimalPlaces: number, data?: { __typename?: 'MarketData', auctionStart?: string | null, auctionEnd?: string | null, markPrice: string, indicativeVolume: string, indicativePrice: string, suppliedStake?: string | null, targetStake?: string | null, bestBidVolume: string, bestOfferVolume: string, bestStaticBidVolume: string, bestStaticOfferVolume: string, trigger: Types.AuctionTrigger, market: { __typename?: 'Market', id: string } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, oracleSpecForTradingTermination: { __typename?: 'OracleSpec', id: string }, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null }, candles?: Array<{ __typename?: 'Candle', open: string, close: string, volume: string } | null> | null } | null };


export const MarketDocument = gql`
    query Market($marketId: ID!, $interval: Interval!, $since: String!) {
  market(id: $marketId) {
    id
    tradingMode
    state
    decimalPlaces
    positionDecimalPlaces
    data {
      market {
        id
      }
      auctionStart
      auctionEnd
      markPrice
      indicativeVolume
      indicativePrice
      suppliedStake
      targetStake
      bestBidVolume
      bestOfferVolume
      bestStaticBidVolume
      bestStaticOfferVolume
      trigger
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
            oracleSpecForTradingTermination {
              id
            }
            quoteName
            settlementAsset {
              id
              symbol
              name
              decimals
            }
          }
        }
      }
    }
    marketTimestamps {
      open
      close
    }
    candles(interval: $interval, since: $since) {
      open
      close
      volume
    }
  }
}
    `;

/**
 * __useMarketQuery__
 *
 * To run a query within a React component, call `useMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketQuery(baseOptions: Apollo.QueryHookOptions<MarketQuery, MarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketQuery, MarketQueryVariables>(MarketDocument, options);
      }
export function useMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketQuery, MarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketQuery, MarketQueryVariables>(MarketDocument, options);
        }
export type MarketQueryHookResult = ReturnType<typeof useMarketQuery>;
export type MarketLazyQueryHookResult = ReturnType<typeof useMarketLazyQuery>;
export type MarketQueryResult = Apollo.QueryResult<MarketQuery, MarketQueryVariables>;