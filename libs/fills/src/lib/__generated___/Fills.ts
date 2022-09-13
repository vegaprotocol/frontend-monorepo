import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FillsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketId?: Types.InputMaybe<Types.Scalars['ID']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type FillsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, tradesConnection?: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, createdAt: string, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } } } } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } | null } | null };

export type FillsSubSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type FillsSubSubscription = { __typename?: 'Subscription', trades?: Array<{ __typename?: 'TradeUpdate', id: string, createdAt: string, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, buyerId: string, sellerId: string, marketId: string, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string } }> | null };


export const FillsDocument = gql`
    query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
  party(id: $partyId) {
    id
    tradesConnection(marketId: $marketId, pagination: $pagination) {
      edges {
        node {
          id
          createdAt
          price
          size
          buyOrder
          sellOrder
          aggressor
          buyer {
            id
          }
          seller {
            id
          }
          buyerFee {
            makerFee
            infrastructureFee
            liquidityFee
          }
          sellerFee {
            makerFee
            infrastructureFee
            liquidityFee
          }
          market {
            id
            decimalPlaces
            positionDecimalPlaces
            tradableInstrument {
              instrument {
                id
                code
                product {
                  ... on Future {
                    settlementAsset {
                      id
                      symbol
                      decimals
                    }
                  }
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
}
    `;

/**
 * __useFillsQuery__
 *
 * To run a query within a React component, call `useFillsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFillsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFillsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      marketId: // value for 'marketId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useFillsQuery(baseOptions: Apollo.QueryHookOptions<FillsQuery, FillsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FillsQuery, FillsQueryVariables>(FillsDocument, options);
      }
export function useFillsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FillsQuery, FillsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FillsQuery, FillsQueryVariables>(FillsDocument, options);
        }
export type FillsQueryHookResult = ReturnType<typeof useFillsQuery>;
export type FillsLazyQueryHookResult = ReturnType<typeof useFillsLazyQuery>;
export type FillsQueryResult = Apollo.QueryResult<FillsQuery, FillsQueryVariables>;
export const FillsSubDocument = gql`
    subscription FillsSub($partyId: ID!) {
  trades(partyId: $partyId) {
    id
    createdAt
    price
    size
    buyOrder
    sellOrder
    aggressor
    buyerId
    sellerId
    buyerFee {
      makerFee
      infrastructureFee
      liquidityFee
    }
    sellerFee {
      makerFee
      infrastructureFee
      liquidityFee
    }
    marketId
  }
}
    `;

/**
 * __useFillsSubSubscription__
 *
 * To run a query within a React component, call `useFillsSubSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFillsSubSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFillsSubSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useFillsSubSubscription(baseOptions: Apollo.SubscriptionHookOptions<FillsSubSubscription, FillsSubSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FillsSubSubscription, FillsSubSubscriptionVariables>(FillsSubDocument, options);
      }
export type FillsSubSubscriptionHookResult = ReturnType<typeof useFillsSubSubscription>;
export type FillsSubSubscriptionResult = Apollo.SubscriptionResult<FillsSubSubscription>;