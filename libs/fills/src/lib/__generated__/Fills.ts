import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FillFieldsFragment = { __typename?: 'Trade', id: string, createdAt: string, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } } } } };

export type FillsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketId?: Types.InputMaybe<Types.Scalars['ID']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type FillsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, tradesConnection: { __typename?: 'TradeConnection', edges: Array<{ __typename?: 'TradeEdge', cursor: string, node: { __typename?: 'Trade', id: string, createdAt: string, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } } } } } }>, pageInfo: { __typename?: 'PageInfo', startCursor: string, endCursor: string, hasNextPage: boolean, hasPreviousPage: boolean } } } | null };

export type FillsEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type FillsEventSubscription = { __typename?: 'Subscription', trades?: Array<{ __typename?: 'Trade', id: string, createdAt: string, price: string, size: string, buyOrder: string, sellOrder: string, aggressor: Types.Side, buyer: { __typename?: 'Party', id: string }, seller: { __typename?: 'Party', id: string }, buyerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, sellerFee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, market: { __typename?: 'Market', id: string, name: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } } } } }> | null };

export const FillFieldsFragmentDoc = gql`
    fragment FillFields on Trade {
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
    name
    decimalPlaces
    positionDecimalPlaces
    tradableInstrument {
      instrument {
        id
        name
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
    `;
export const FillsDocument = gql`
    query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
  party(id: $partyId) {
    id
    tradesConnection(marketId: $marketId, pagination: $pagination) {
      edges {
        node {
          ...FillFields
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
    ${FillFieldsFragmentDoc}`;

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
export const FillsEventDocument = gql`
    subscription FillsEvent($partyId: ID!) {
  trades(partyId: $partyId) {
    ...FillFields
  }
}
    ${FillFieldsFragmentDoc}`;

/**
 * __useFillsEventSubscription__
 *
 * To run a query within a React component, call `useFillsEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useFillsEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFillsEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useFillsEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<FillsEventSubscription, FillsEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<FillsEventSubscription, FillsEventSubscriptionVariables>(FillsEventDocument, options);
      }
export type FillsEventSubscriptionHookResult = ReturnType<typeof useFillsEventSubscription>;
export type FillsEventSubscriptionResult = Apollo.SubscriptionResult<FillsEventSubscription>;