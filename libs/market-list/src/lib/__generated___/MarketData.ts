import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketDataFieldsFragment = { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, indicativeVolume: string, market: { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode } };

export type MarketListQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketListQuery = { __typename?: 'Query', markets?: Array<{ __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, indicativeVolume: string, market: { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', symbol: string } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null }, candles?: Array<{ __typename?: 'Candle', open: string, close: string, high: string, low: string } | null> | null }> | null };

export type MarketDataSubSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketDataSubSubscription = { __typename?: 'Subscription', marketData: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, indicativeVolume: string, market: { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode } } };

export const MarketDataFieldsFragmentDoc = gql`
    fragment MarketDataFields on MarketData {
  market {
    id
    state
    tradingMode
  }
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  indicativeVolume
}
    `;
export const MarketListDocument = gql`
    query MarketList($interval: Interval!, $since: String!) {
  markets {
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
    data {
      market {
        id
        state
        tradingMode
      }
      bestBidPrice
      bestOfferPrice
      markPrice
      trigger
      indicativeVolume
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
    candles(interval: $interval, since: $since) {
      open
      close
      high
      low
    }
  }
}
    `;

/**
 * __useMarketListQuery__
 *
 * To run a query within a React component, call `useMarketListQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketListQuery({
 *   variables: {
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketListQuery(baseOptions: Apollo.QueryHookOptions<MarketListQuery, MarketListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketListQuery, MarketListQueryVariables>(MarketListDocument, options);
      }
export function useMarketListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketListQuery, MarketListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketListQuery, MarketListQueryVariables>(MarketListDocument, options);
        }
export type MarketListQueryHookResult = ReturnType<typeof useMarketListQuery>;
export type MarketListLazyQueryHookResult = ReturnType<typeof useMarketListLazyQuery>;
export type MarketListQueryResult = Apollo.QueryResult<MarketListQuery, MarketListQueryVariables>;
export const MarketDataSubDocument = gql`
    subscription MarketDataSub {
  marketData {
    ...MarketDataFields
  }
}
    ${MarketDataFieldsFragmentDoc}`;

/**
 * __useMarketDataSubSubscription__
 *
 * To run a query within a React component, call `useMarketDataSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataSubSubscription({
 *   variables: {
 *   },
 * });
 */
export function useMarketDataSubSubscription(baseOptions?: Apollo.SubscriptionHookOptions<MarketDataSubSubscription, MarketDataSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDataSubSubscription, MarketDataSubSubscriptionVariables>(MarketDataSubDocument, options);
      }
export type MarketDataSubSubscriptionHookResult = ReturnType<typeof useMarketDataSubSubscription>;
export type MarketDataSubSubscriptionResult = Apollo.SubscriptionResult<MarketDataSubSubscription>;