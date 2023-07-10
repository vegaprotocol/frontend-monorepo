import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PriceLevelFieldsFragment = { __typename: 'PriceLevel', price: string, volume: string, numberOfOrders: string };

export type MarketDepthQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDepthQuery = { __typename: 'Query', market?: { __typename: 'Market', id: string, depth: { __typename: 'MarketDepth', sequenceNumber: string, sell?: Array<{ __typename: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null, buy?: Array<{ __typename: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null } } | null };

export type MarketDepthUpdateSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDepthUpdateSubscription = { __typename: 'Subscription', marketsDepthUpdate: Array<{ __typename: 'ObservableMarketDepthUpdate', marketId: string, sequenceNumber: string, previousSequenceNumber: string, sell?: Array<{ __typename: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null, buy?: Array<{ __typename: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null }> };

export const PriceLevelFieldsFragmentDoc = gql`
    fragment PriceLevelFields on PriceLevel {
  price
  volume
  numberOfOrders
}
    `;
export const MarketDepthDocument = gql`
    query MarketDepth($marketId: ID!) {
  market(id: $marketId) {
    id
    depth {
      sell {
        ...PriceLevelFields
      }
      buy {
        ...PriceLevelFields
      }
      sequenceNumber
    }
  }
}
    ${PriceLevelFieldsFragmentDoc}`;

/**
 * __useMarketDepthQuery__
 *
 * To run a query within a React component, call `useMarketDepthQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketDepthQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDepthQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDepthQuery(baseOptions: Apollo.QueryHookOptions<MarketDepthQuery, MarketDepthQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketDepthQuery, MarketDepthQueryVariables>(MarketDepthDocument, options);
      }
export function useMarketDepthLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketDepthQuery, MarketDepthQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketDepthQuery, MarketDepthQueryVariables>(MarketDepthDocument, options);
        }
export type MarketDepthQueryHookResult = ReturnType<typeof useMarketDepthQuery>;
export type MarketDepthLazyQueryHookResult = ReturnType<typeof useMarketDepthLazyQuery>;
export type MarketDepthQueryResult = Apollo.QueryResult<MarketDepthQuery, MarketDepthQueryVariables>;
export const MarketDepthUpdateDocument = gql`
    subscription MarketDepthUpdate($marketId: ID!) {
  marketsDepthUpdate(marketIds: [$marketId]) {
    marketId
    sell {
      ...PriceLevelFields
    }
    buy {
      ...PriceLevelFields
    }
    sequenceNumber
    previousSequenceNumber
  }
}
    ${PriceLevelFieldsFragmentDoc}`;

/**
 * __useMarketDepthUpdateSubscription__
 *
 * To run a query within a React component, call `useMarketDepthUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDepthUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDepthUpdateSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDepthUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketDepthUpdateSubscription, MarketDepthUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDepthUpdateSubscription, MarketDepthUpdateSubscriptionVariables>(MarketDepthUpdateDocument, options);
      }
export type MarketDepthUpdateSubscriptionHookResult = ReturnType<typeof useMarketDepthUpdateSubscription>;
export type MarketDepthUpdateSubscriptionResult = Apollo.SubscriptionResult<MarketDepthUpdateSubscription>;