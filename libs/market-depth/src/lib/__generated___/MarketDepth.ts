import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketDepthQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDepthQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, data?: { __typename?: 'MarketData', staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, market: { __typename?: 'Market', id: string } } | null, depth: { __typename?: 'MarketDepth', sequenceNumber: string, lastTrade?: { __typename?: 'Trade', price: string } | null, sell?: Array<{ __typename?: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null, buy?: Array<{ __typename?: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null } } | null };

export type MarketDepthSubscriptionSubscriptionVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketDepthSubscriptionSubscription = { __typename?: 'Subscription', marketDepthUpdate: { __typename?: 'MarketDepthUpdate', sequenceNumber: string, market: { __typename?: 'Market', id: string, positionDecimalPlaces: number, data?: { __typename?: 'MarketData', staticMidPrice: string, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, market: { __typename?: 'Market', id: string } } | null }, sell?: Array<{ __typename?: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null, buy?: Array<{ __typename?: 'PriceLevel', price: string, volume: string, numberOfOrders: string }> | null } };


export const MarketDepthDocument = gql`
    query MarketDepth($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    data {
      staticMidPrice
      marketTradingMode
      indicativeVolume
      indicativePrice
      bestStaticBidPrice
      bestStaticOfferPrice
      market {
        id
      }
    }
    depth {
      lastTrade {
        price
      }
      sell {
        price
        volume
        numberOfOrders
      }
      buy {
        price
        volume
        numberOfOrders
      }
      sequenceNumber
    }
  }
}
    `;

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
export const MarketDepthSubscriptionDocument = gql`
    subscription MarketDepthSubscription($marketId: ID!) {
  marketDepthUpdate(marketId: $marketId) {
    market {
      id
      positionDecimalPlaces
      data {
        staticMidPrice
        marketTradingMode
        indicativeVolume
        indicativePrice
        bestStaticBidPrice
        bestStaticOfferPrice
        market {
          id
        }
      }
    }
    sell {
      price
      volume
      numberOfOrders
    }
    buy {
      price
      volume
      numberOfOrders
    }
    sequenceNumber
  }
}
    `;

/**
 * __useMarketDepthSubscriptionSubscription__
 *
 * To run a query within a React component, call `useMarketDepthSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarketDepthSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDepthSubscriptionSubscription({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketDepthSubscriptionSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarketDepthSubscriptionSubscription, MarketDepthSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarketDepthSubscriptionSubscription, MarketDepthSubscriptionSubscriptionVariables>(MarketDepthSubscriptionDocument, options);
      }
export type MarketDepthSubscriptionSubscriptionHookResult = ReturnType<typeof useMarketDepthSubscriptionSubscription>;
export type MarketDepthSubscriptionSubscriptionResult = Apollo.SubscriptionResult<MarketDepthSubscriptionSubscription>;