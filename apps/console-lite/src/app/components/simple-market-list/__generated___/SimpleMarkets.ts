import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SimpleMarketDataFieldsFragment = { __typename?: 'MarketData', market: { __typename?: 'Market', id: string, state: Types.MarketState } };

export type SimpleMarketsQueryVariables = Types.Exact<{
  CandleSince: Types.Scalars['String'];
}>;


export type SimpleMarketsQuery = { __typename?: 'Query', markets?: Array<{ __typename?: 'Market', id: string, name: string, state: Types.MarketState, data?: { __typename?: 'MarketData', market: { __typename?: 'Market', id: string, state: Types.MarketState } } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', symbol: string } } } }, candles?: Array<{ __typename?: 'Candle', open: string, close: string } | null> | null }> | null };

export type SimpleMarketDataSubSubscriptionVariables = Types.Exact<{ [key: string]: never; }>;


export type SimpleMarketDataSubSubscription = { __typename?: 'Subscription', marketData: { __typename?: 'MarketData', market: { __typename?: 'Market', id: string, state: Types.MarketState } } };

export const SimpleMarketDataFieldsFragmentDoc = gql`
    fragment SimpleMarketDataFields on MarketData {
  market {
    id
    state
  }
}
    `;
export const SimpleMarketsDocument = gql`
    query SimpleMarkets($CandleSince: String!) {
  markets {
    id
    name
    state
    data {
      ...SimpleMarketDataFields
    }
    tradableInstrument {
      instrument {
        code
        metadata {
          tags
        }
        product {
          __typename
          ... on Future {
            quoteName
            settlementAsset {
              symbol
            }
          }
        }
      }
    }
    candles(interval: INTERVAL_I1H, since: $CandleSince) {
      open
      close
    }
  }
}
    ${SimpleMarketDataFieldsFragmentDoc}`;

/**
 * __useSimpleMarketsQuery__
 *
 * To run a query within a React component, call `useSimpleMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSimpleMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimpleMarketsQuery({
 *   variables: {
 *      CandleSince: // value for 'CandleSince'
 *   },
 * });
 */
export function useSimpleMarketsQuery(baseOptions: Apollo.QueryHookOptions<SimpleMarketsQuery, SimpleMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SimpleMarketsQuery, SimpleMarketsQueryVariables>(SimpleMarketsDocument, options);
      }
export function useSimpleMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SimpleMarketsQuery, SimpleMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SimpleMarketsQuery, SimpleMarketsQueryVariables>(SimpleMarketsDocument, options);
        }
export type SimpleMarketsQueryHookResult = ReturnType<typeof useSimpleMarketsQuery>;
export type SimpleMarketsLazyQueryHookResult = ReturnType<typeof useSimpleMarketsLazyQuery>;
export type SimpleMarketsQueryResult = Apollo.QueryResult<SimpleMarketsQuery, SimpleMarketsQueryVariables>;
export const SimpleMarketDataSubDocument = gql`
    subscription SimpleMarketDataSub {
  marketData {
    ...SimpleMarketDataFields
  }
}
    ${SimpleMarketDataFieldsFragmentDoc}`;

/**
 * __useSimpleMarketDataSubSubscription__
 *
 * To run a query within a React component, call `useSimpleMarketDataSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSimpleMarketDataSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSimpleMarketDataSubSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSimpleMarketDataSubSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SimpleMarketDataSubSubscription, SimpleMarketDataSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SimpleMarketDataSubSubscription, SimpleMarketDataSubSubscriptionVariables>(SimpleMarketDataSubDocument, options);
      }
export type SimpleMarketDataSubSubscriptionHookResult = ReturnType<typeof useSimpleMarketDataSubSubscription>;
export type SimpleMarketDataSubSubscriptionResult = Apollo.SubscriptionResult<SimpleMarketDataSubSubscription>;