import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DealTicketQueryQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type DealTicketQueryQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, product: { __typename?: 'Future', quoteName: string, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string } } } }, depth: { __typename?: 'MarketDepth', lastTrade?: { __typename?: 'Trade', price: string } | null } } | null };


export const DealTicketQueryDocument = gql`
    query DealTicketQuery($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    state
    tradingMode
    tradableInstrument {
      instrument {
        id
        name
        product {
          ... on Future {
            quoteName
            settlementAsset {
              id
              symbol
              name
            }
          }
        }
      }
    }
    depth {
      lastTrade {
        price
      }
    }
  }
}
    `;

/**
 * __useDealTicketQueryQuery__
 *
 * To run a query within a React component, call `useDealTicketQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useDealTicketQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDealTicketQueryQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useDealTicketQueryQuery(baseOptions: Apollo.QueryHookOptions<DealTicketQueryQuery, DealTicketQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DealTicketQueryQuery, DealTicketQueryQueryVariables>(DealTicketQueryDocument, options);
      }
export function useDealTicketQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DealTicketQueryQuery, DealTicketQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DealTicketQueryQuery, DealTicketQueryQueryVariables>(DealTicketQueryDocument, options);
        }
export type DealTicketQueryQueryHookResult = ReturnType<typeof useDealTicketQueryQuery>;
export type DealTicketQueryLazyQueryHookResult = ReturnType<typeof useDealTicketQueryLazyQuery>;
export type DealTicketQueryQueryResult = Apollo.QueryResult<DealTicketQueryQuery, DealTicketQueryQueryVariables>;