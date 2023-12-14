import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type BarFragment = { __typename?: 'Candle', periodStart: any, lastUpdateInPeriod: any, high: string, low: string, open: string, close: string, volume: string };

export type GetBarsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
  since: Types.Scalars['String'];
  to?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type GetBarsQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, candlesConnection?: { __typename?: 'CandleDataConnection', edges?: Array<{ __typename?: 'CandleEdge', node: { __typename?: 'Candle', periodStart: any, lastUpdateInPeriod: any, high: string, low: string, open: string, close: string, volume: string } } | null> | null } | null } | null };

export type LastBarSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
}>;


export type LastBarSubscription = { __typename?: 'Subscription', candles: { __typename?: 'Candle', periodStart: any, lastUpdateInPeriod: any, high: string, low: string, open: string, close: string, volume: string } };

export const BarFragmentDoc = gql`
    fragment Bar on Candle {
  periodStart
  lastUpdateInPeriod
  high
  low
  open
  close
  volume
}
    `;
export const GetBarsDocument = gql`
    query GetBars($marketId: ID!, $interval: Interval!, $since: String!, $to: String) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    candlesConnection(
      interval: $interval
      since: $since
      to: $to
      pagination: {last: 5000}
    ) {
      edges {
        node {
          ...Bar
        }
      }
    }
  }
}
    ${BarFragmentDoc}`;

/**
 * __useGetBarsQuery__
 *
 * To run a query within a React component, call `useGetBarsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBarsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBarsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *      to: // value for 'to'
 *   },
 * });
 */
export function useGetBarsQuery(baseOptions: Apollo.QueryHookOptions<GetBarsQuery, GetBarsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBarsQuery, GetBarsQueryVariables>(GetBarsDocument, options);
      }
export function useGetBarsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBarsQuery, GetBarsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBarsQuery, GetBarsQueryVariables>(GetBarsDocument, options);
        }
export type GetBarsQueryHookResult = ReturnType<typeof useGetBarsQuery>;
export type GetBarsLazyQueryHookResult = ReturnType<typeof useGetBarsLazyQuery>;
export type GetBarsQueryResult = Apollo.QueryResult<GetBarsQuery, GetBarsQueryVariables>;
export const LastBarDocument = gql`
    subscription LastBar($marketId: ID!, $interval: Interval!) {
  candles(marketId: $marketId, interval: $interval) {
    ...Bar
  }
}
    ${BarFragmentDoc}`;

/**
 * __useLastBarSubscription__
 *
 * To run a query within a React component, call `useLastBarSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLastBarSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLastBarSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useLastBarSubscription(baseOptions: Apollo.SubscriptionHookOptions<LastBarSubscription, LastBarSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<LastBarSubscription, LastBarSubscriptionVariables>(LastBarDocument, options);
      }
export type LastBarSubscriptionHookResult = ReturnType<typeof useLastBarSubscription>;
export type LastBarSubscriptionResult = Apollo.SubscriptionResult<LastBarSubscription>;