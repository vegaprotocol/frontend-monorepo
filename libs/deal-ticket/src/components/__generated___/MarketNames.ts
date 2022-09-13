import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DealTicketMarketNamesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type DealTicketMarketNamesQuery = { __typename?: 'Query', markets?: Array<{ __typename?: 'Market', id: string, state: Types.MarketState, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, name: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string } } } }> | null };


export const DealTicketMarketNamesDocument = gql`
    query DealTicketMarketNames {
  markets {
    id
    state
    tradableInstrument {
      instrument {
        code
        name
        metadata {
          tags
        }
        product {
          ... on Future {
            quoteName
          }
        }
      }
    }
  }
}
    `;

/**
 * __useDealTicketMarketNamesQuery__
 *
 * To run a query within a React component, call `useDealTicketMarketNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDealTicketMarketNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDealTicketMarketNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function useDealTicketMarketNamesQuery(baseOptions?: Apollo.QueryHookOptions<DealTicketMarketNamesQuery, DealTicketMarketNamesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DealTicketMarketNamesQuery, DealTicketMarketNamesQueryVariables>(DealTicketMarketNamesDocument, options);
      }
export function useDealTicketMarketNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DealTicketMarketNamesQuery, DealTicketMarketNamesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DealTicketMarketNamesQuery, DealTicketMarketNamesQueryVariables>(DealTicketMarketNamesDocument, options);
        }
export type DealTicketMarketNamesQueryHookResult = ReturnType<typeof useDealTicketMarketNamesQuery>;
export type DealTicketMarketNamesLazyQueryHookResult = ReturnType<typeof useDealTicketMarketNamesLazyQuery>;
export type DealTicketMarketNamesQueryResult = Apollo.QueryResult<DealTicketMarketNamesQuery, DealTicketMarketNamesQueryVariables>;