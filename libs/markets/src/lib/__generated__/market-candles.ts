import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketCandlesFieldsFragment = { __typename: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any };

export type MarketCandlesQueryVariables = Types.Exact<{
  interval: Types.Interval;
  since: Types.Scalars['String'];
  marketId: Types.Scalars['ID'];
}>;


export type MarketCandlesQuery = { __typename: 'Query', marketsConnection?: { __typename: 'MarketConnection', edges: Array<{ __typename: 'MarketEdge', node: { __typename: 'Market', candlesConnection?: { __typename: 'CandleDataConnection', edges?: Array<{ __typename: 'CandleEdge', node: { __typename: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } } | null> | null } | null } }> } | null };

export type MarketCandlesUpdateSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
}>;


export type MarketCandlesUpdateSubscription = { __typename: 'Subscription', candles: { __typename: 'Candle', high: string, low: string, open: string, close: string, volume: string, periodStart: any } };

export const MarketCandlesFieldsFragmentDoc = gql`
    fragment MarketCandlesFields on Candle {
  high
  low
  open
  close
  volume
  periodStart
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
              ...MarketCandlesFields
            }
          }
        }
      }
    }
  }
}
    ${MarketCandlesFieldsFragmentDoc}`;

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
export const MarketCandlesUpdateDocument = gql`
    subscription MarketCandlesUpdate($marketId: ID!, $interval: Interval!) {
  candles(interval: $interval, marketId: $marketId) {
    ...MarketCandlesFields
  }
}
    ${MarketCandlesFieldsFragmentDoc}`;

/**
 * __useMarketCandlesUpdateSubscription__
 *
 * To run a query within a React component, call `useMarketCandlesUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketCandlesUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketCandlesUpdateSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useMarketCandlesUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketCandlesUpdateSubscription, MarketCandlesUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketCandlesUpdateSubscription, MarketCandlesUpdateSubscriptionVariables>(MarketCandlesUpdateDocument, options);
      }
export type MarketCandlesUpdateSubscriptionHookResult = ReturnType<typeof useMarketCandlesUpdateSubscription>;
export type MarketCandlesUpdateSubscriptionResult = Apollo.SubscriptionResult<MarketCandlesUpdateSubscription>;