import * as Types from '@vegaprotocol/types/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CandleFieldsFragment = { __typename?: 'Candle', datetime: string, high: string, low: string, open: string, close: string, volume: string };

export type CandlesQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
  since: Types.Scalars['String'];
}>;


export type CandlesQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string } }, candles?: Array<{ __typename?: 'Candle', datetime: string, high: string, low: string, open: string, close: string, volume: string } | null> | null } | null };

export type CandlesSubSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  interval: Types.Interval;
}>;


export type CandlesSubSubscription = { __typename?: 'Subscription', candles: { __typename?: 'Candle', datetime: string, high: string, low: string, open: string, close: string, volume: string } };

export const CandleFieldsFragmentDoc = gql`
    fragment CandleFields on Candle {
  datetime
  high
  low
  open
  close
  volume
}
    `;
export const CandlesDocument = gql`
    query Candles($marketId: ID!, $interval: Interval!, $since: String!) {
  market(id: $marketId) {
    id
    decimalPlaces
    tradableInstrument {
      instrument {
        id
        name
        code
      }
    }
    candles(interval: $interval, since: $since) {
      ...CandleFields
    }
  }
}
    ${CandleFieldsFragmentDoc}`;

/**
 * __useCandlesQuery__
 *
 * To run a query within a React component, call `useCandlesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCandlesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCandlesQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *      since: // value for 'since'
 *   },
 * });
 */
export function useCandlesQuery(baseOptions: Apollo.QueryHookOptions<CandlesQuery, CandlesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CandlesQuery, CandlesQueryVariables>(CandlesDocument, options);
      }
export function useCandlesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CandlesQuery, CandlesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CandlesQuery, CandlesQueryVariables>(CandlesDocument, options);
        }
export type CandlesQueryHookResult = ReturnType<typeof useCandlesQuery>;
export type CandlesLazyQueryHookResult = ReturnType<typeof useCandlesLazyQuery>;
export type CandlesQueryResult = Apollo.QueryResult<CandlesQuery, CandlesQueryVariables>;
export const CandlesSubDocument = gql`
    subscription CandlesSub($marketId: ID!, $interval: Interval!) {
  candles(marketId: $marketId, interval: $interval) {
    ...CandleFields
  }
}
    ${CandleFieldsFragmentDoc}`;

/**
 * __useCandlesSubSubscription__
 *
 * To run a query within a React component, call `useCandlesSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useCandlesSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCandlesSubSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      interval: // value for 'interval'
 *   },
 * });
 */
export function useCandlesSubSubscription(baseOptions: Apollo.SubscriptionHookOptions<CandlesSubSubscription, CandlesSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<CandlesSubSubscription, CandlesSubSubscriptionVariables>(CandlesSubDocument, options);
      }
export type CandlesSubSubscriptionHookResult = ReturnType<typeof useCandlesSubSubscription>;
export type CandlesSubSubscriptionResult = Apollo.SubscriptionResult<CandlesSubSubscription>;