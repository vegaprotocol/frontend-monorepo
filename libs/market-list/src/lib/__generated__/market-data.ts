import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketDataUpdateFieldsFragment = { __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null };

export type MarketDataUpdateSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataUpdateSubscription = { __typename?: 'Subscription', marketsData: Array<{ __typename?: 'ObservableMarketData', marketId: string, bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null }> };

export type MarketDataFieldsFragment = { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, market: { __typename?: 'Market', id: string } };

export type MarketDataQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, marketState: Types.MarketState, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, market: { __typename?: 'Market', id: string } } | null } }> } | null };

export const MarketDataUpdateFieldsFragmentDoc = gql`
    fragment MarketDataUpdateFields on ObservableMarketData {
  marketId
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketTradingMode
  marketState
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
  targetStake
  suppliedStake
}
    `;
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
  marketState
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
  targetStake
  suppliedStake
  auctionStart
  auctionEnd
}
    `;
export const MarketDataUpdateDocument = gql`
    subscription MarketDataUpdate($marketId: ID!) {
  marketsData(marketIds: [$marketId]) {
    ...MarketDataUpdateFields
  }
}
    ${MarketDataUpdateFieldsFragmentDoc}`;

/**
 * __useMarketDataUpdateSubscription__
 *
 * To run a query within a React component, call `useMarketDataUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataUpdateSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDataUpdateSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketDataUpdateSubscription, MarketDataUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDataUpdateSubscription, MarketDataUpdateSubscriptionVariables>(MarketDataUpdateDocument, options);
      }
export type MarketDataUpdateSubscriptionHookResult = ReturnType<typeof useMarketDataUpdateSubscription>;
export type MarketDataUpdateSubscriptionResult = Apollo.SubscriptionResult<MarketDataUpdateSubscription>;
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