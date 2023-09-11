import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketDataUpdateFieldsFragment = { __typename?: 'ObservableMarketData', marketId: string, auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, fundingRate?: string | null, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, marketValueProxy: string, markPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, lastTradedPrice: string, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null };

export type MarketDataUpdateSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataUpdateSubscription = { __typename?: 'Subscription', marketsData: Array<{ __typename?: 'ObservableMarketData', marketId: string, auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, fundingRate?: string | null, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, marketValueProxy: string, markPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, lastTradedPrice: string, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null }> };

export type MarketDataFieldsFragment = { __typename?: 'MarketData', auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, fundingRate?: string | null, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, marketValueProxy: string, markPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, lastTradedPrice: string, market: { __typename?: 'Market', id: string }, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null };

export type MarketDataQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDataQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', data?: { __typename?: 'MarketData', auctionEnd?: string | null, auctionStart?: string | null, bestBidPrice: string, bestBidVolume: string, bestOfferPrice: string, bestOfferVolume: string, bestStaticBidPrice: string, bestStaticBidVolume: string, bestStaticOfferPrice: string, bestStaticOfferVolume: string, fundingRate?: string | null, indicativePrice: string, indicativeVolume: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, marketValueProxy: string, markPrice: string, midPrice: string, openInterest: string, staticMidPrice: string, suppliedStake?: string | null, targetStake?: string | null, trigger: Types.AuctionTrigger, lastTradedPrice: string, market: { __typename?: 'Market', id: string }, priceMonitoringBounds?: Array<{ __typename?: 'PriceMonitoringBounds', minValidPrice: string, maxValidPrice: string, referencePrice: string, trigger: { __typename?: 'PriceMonitoringTrigger', horizonSecs: number, probability: number, auctionExtensionSecs: number } }> | null } | null } }> } | null };

export const MarketDataUpdateFieldsFragmentDoc = gql`
    fragment MarketDataUpdateFields on ObservableMarketData {
  marketId
  auctionEnd
  auctionStart
  bestBidPrice
  bestBidVolume
  bestOfferPrice
  bestOfferVolume
  bestStaticBidPrice
  bestStaticBidVolume
  bestStaticOfferPrice
  bestStaticOfferVolume
  fundingRate
  indicativePrice
  indicativeVolume
  marketState
  marketTradingMode
  marketValueProxy
  markPrice
  midPrice
  openInterest
  priceMonitoringBounds {
    minValidPrice
    maxValidPrice
    trigger {
      horizonSecs
      probability
      auctionExtensionSecs
    }
    referencePrice
  }
  staticMidPrice
  suppliedStake
  targetStake
  trigger
  lastTradedPrice
}
    `;
export const MarketDataFieldsFragmentDoc = gql`
    fragment MarketDataFields on MarketData {
  market {
    id
  }
  auctionEnd
  auctionStart
  bestBidPrice
  bestBidVolume
  bestOfferPrice
  bestOfferVolume
  bestStaticBidPrice
  bestStaticBidVolume
  bestStaticOfferPrice
  bestStaticOfferVolume
  fundingRate
  indicativePrice
  indicativeVolume
  marketState
  marketTradingMode
  marketValueProxy
  markPrice
  midPrice
  openInterest
  priceMonitoringBounds {
    minValidPrice
    maxValidPrice
    trigger {
      horizonSecs
      probability
      auctionExtensionSecs
    }
    referencePrice
  }
  staticMidPrice
  suppliedStake
  targetStake
  trigger
  lastTradedPrice
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