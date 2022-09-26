import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketDataFieldsFragment = { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, market: { __typename?: 'Market', id: string } };

export type MarketDataQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, market: { __typename?: 'Market', id: string } } | null } }> } | null };

export type MarketsDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketsDataQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, market: { __typename?: 'Market', id: string } } | null } }> } | null };

export type MarketDataEventFieldsFragment = { __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string };

export type MarketDataEventSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataEventSubscription = { __typename?: 'Subscription', marketsData: Array<{ __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string }> };

export const MarketDataFieldsFragmentDoc = gql`
    fragment MarketDataFields on MarketData {
  market {
    id
  }
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketTradingMode
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
}
    `;
export const MarketDataEventFieldsFragmentDoc = gql`
    fragment MarketDataEventFields on ObservableMarketData {
  marketId
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketTradingMode
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
}
    `;
export const MarketDataDocument = gql`
    query MarketData($marketId: ID!) {
  marketsConnection(id: $marketId) {
    edges {
      node {
        data {
          ...MarketDataFields
        }
      }
    }
  }
}
    ${MarketDataFieldsFragmentDoc}`;

/**
 * __useMarketDataQuery__
 *
 * To run a query within a React component, call `useMarketDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDataQuery(baseOptions: Apollo.QueryHookOptions<MarketDataQuery, MarketDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketDataQuery, MarketDataQueryVariables>(MarketDataDocument, options);
      }
export function useMarketDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketDataQuery, MarketDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketDataQuery, MarketDataQueryVariables>(MarketDataDocument, options);
        }
export type MarketDataQueryHookResult = ReturnType<typeof useMarketDataQuery>;
export type MarketDataLazyQueryHookResult = ReturnType<typeof useMarketDataLazyQuery>;
export type MarketDataQueryResult = Apollo.QueryResult<MarketDataQuery, MarketDataQueryVariables>;
export const MarketsDataDocument = gql`
    query MarketsData {
  marketsConnection {
    edges {
      node {
        data {
          ...MarketDataFields
        }
      }
    }
  }
}
    ${MarketDataFieldsFragmentDoc}`;

/**
 * __useMarketsDataQuery__
 *
 * To run a query within a React component, call `useMarketsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketsDataQuery(baseOptions?: Apollo.QueryHookOptions<MarketsDataQuery, MarketsDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsDataQuery, MarketsDataQueryVariables>(MarketsDataDocument, options);
      }
export function useMarketsDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsDataQuery, MarketsDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsDataQuery, MarketsDataQueryVariables>(MarketsDataDocument, options);
        }
export type MarketsDataQueryHookResult = ReturnType<typeof useMarketsDataQuery>;
export type MarketsDataLazyQueryHookResult = ReturnType<typeof useMarketsDataLazyQuery>;
export type MarketsDataQueryResult = Apollo.QueryResult<MarketsDataQuery, MarketsDataQueryVariables>;
export const MarketDataEventDocument = gql`
    subscription MarketDataEvent($marketId: ID!) {
  marketsData(marketIds: [$marketId]) {
    ...MarketDataEventFields
  }
}
    ${MarketDataEventFieldsFragmentDoc}`;

/**
 * __useMarketDataEventSubscription__
 *
 * To run a query within a React component, call `useMarketDataEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataEventSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDataEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketDataEventSubscription, MarketDataEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDataEventSubscription, MarketDataEventSubscriptionVariables>(MarketDataEventDocument, options);
      }
export type MarketDataEventSubscriptionHookResult = ReturnType<typeof useMarketDataEventSubscription>;
export type MarketDataEventSubscriptionResult = Apollo.SubscriptionResult<MarketDataEventSubscription>;