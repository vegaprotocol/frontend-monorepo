import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketCandleFieldsFragment = { __typename?: 'CandleNode', high: string, low: string, open: string, close: string, volume: string };

export type MarketCandlesQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
  marketId: Types.Scalars['ID'];
}>;


export type MarketCandlesQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'CandleNode', high: string, low: string, open: string, close: string, volume: string } } | null> | null } | null } }> } | null };

export type MarketsCandlesNodeFieldsFragment = { __typename?: 'Market', id: string, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'CandleNode', high: string, low: string, open: string, close: string, volume: string } } | null> | null } | null };

export type MarketsCandlesQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type MarketsCandlesQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'CandleNode', high: string, low: string, open: string, close: string, volume: string } } | null> | null } | null } }> } | null };

export type MarketCandleEventFieldsFragment = { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string };

export type MarketCandlesEventSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
}>;


export type MarketCandlesEventSubscription = { __typename?: 'Subscription', candles: { __typename?: 'Candle', high: string, low: string, open: string, close: string, volume: string } };

export const MarketCandleFieldsFragmentDoc = gql`
    fragment MarketCandleFields on CandleNode {
  high
  low
  open
  close
  volume
}
    `;
export const MarketsCandlesNodeFieldsFragmentDoc = gql`
    fragment MarketsCandlesNodeFields on Market {
  id
  candlesConnection(interval: $interval, since: $since) {
    edges {
      node {
        ...MarketCandleFields
      }
    }
  }
}
    ${MarketCandleFieldsFragmentDoc}`;
export const MarketCandleEventFieldsFragmentDoc = gql`
    fragment MarketCandleEventFields on Candle {
  high
  low
  open
  close
  volume
}
    `;
export const MarketCandlesDocument = gql`
    query MarketCandles($interval: Interval!, $since: String!, $marketId: ID!) {
  marketsConnection(id: $marketId) {
    edges {
      node {
        candlesConnection(interval: $interval, since: $since) {
          edges {
            node {
              ...MarketCandleFields
            }
          }
        }
      }
    }
  }
}
    ${MarketCandleFieldsFragmentDoc}`;

/**
 * __useMarketCandlesQuery__
 *
 * To run a query within a React component, call `useMarketCandlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketCandlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketCandlesQuery({
 *   variables: {
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketCandlesQuery(baseOptions: Apollo.QueryHookOptions<MarketCandlesQuery, MarketCandlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketCandlesQuery, MarketCandlesQueryVariables>(MarketCandlesDocument, options);
      }
export function useMarketCandlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketCandlesQuery, MarketCandlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketCandlesQuery, MarketCandlesQueryVariables>(MarketCandlesDocument, options);
        }
export type MarketCandlesQueryHookResult = ReturnType<typeof useMarketCandlesQuery>;
export type MarketCandlesLazyQueryHookResult = ReturnType<typeof useMarketCandlesLazyQuery>;
export type MarketCandlesQueryResult = Apollo.QueryResult<MarketCandlesQuery, MarketCandlesQueryVariables>;
export const MarketsCandlesDocument = gql`
    query MarketsCandles($interval: Interval!, $since: String!) {
  marketsConnection {
    edges {
      node {
        ...MarketsCandlesNodeFields
      }
    }
  }
}
    ${MarketsCandlesNodeFieldsFragmentDoc}`;

/**
 * __useMarketsCandlesQuery__
 *
 * To run a query within a React component, call `useMarketsCandlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsCandlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsCandlesQuery({
 *   variables: {
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useMarketsCandlesQuery(baseOptions: Apollo.QueryHookOptions<MarketsCandlesQuery, MarketsCandlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsCandlesQuery, MarketsCandlesQueryVariables>(MarketsCandlesDocument, options);
      }
export function useMarketsCandlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsCandlesQuery, MarketsCandlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsCandlesQuery, MarketsCandlesQueryVariables>(MarketsCandlesDocument, options);
        }
export type MarketsCandlesQueryHookResult = ReturnType<typeof useMarketsCandlesQuery>;
export type MarketsCandlesLazyQueryHookResult = ReturnType<typeof useMarketsCandlesLazyQuery>;
export type MarketsCandlesQueryResult = Apollo.QueryResult<MarketsCandlesQuery, MarketsCandlesQueryVariables>;
export const MarketCandlesEventDocument = gql`
    subscription MarketCandlesEvent($marketId: ID!, $interval: Interval!) {
  candles(interval: $interval, marketId: $marketId) {
    ...MarketCandleEventFields
  }
}
    ${MarketCandleEventFieldsFragmentDoc}`;

/**
 * __useMarketCandlesEventSubscription__
 *
 * To run a query within a React component, call `useMarketCandlesEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketCandlesEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketCandlesEventSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useMarketCandlesEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketCandlesEventSubscription, MarketCandlesEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketCandlesEventSubscription, MarketCandlesEventSubscriptionVariables>(MarketCandlesEventDocument, options);
      }
export type MarketCandlesEventSubscriptionHookResult = ReturnType<typeof useMarketCandlesEventSubscription>;
export type MarketCandlesEventSubscriptionResult = Apollo.SubscriptionResult<MarketCandlesEventSubscription>;