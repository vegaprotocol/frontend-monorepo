import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyBalanceQueryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyBalanceQueryQuery = { __typename?: 'Query', party?: { __typename?: 'Party', accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } | null> | null } | null } | null };


export const PartyBalanceQueryDocument = gql`
    query PartyBalanceQuery($partyId: ID!) {
  party(id: $partyId) {
    accountsConnection {
      edges {
        node {
          type
          balance
          asset {
            id
            symbol
            name
            decimals
          }
        }
      }
    }
  }
}
    `;

/**
 * __usePartyBalanceQueryQuery__
 *
 * To run a query within a React component, call `usePartyBalanceQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyBalanceQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyBalanceQueryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyBalanceQueryQuery(baseOptions: Apollo.QueryHookOptions<PartyBalanceQueryQuery, PartyBalanceQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyBalanceQueryQuery, PartyBalanceQueryQueryVariables>(PartyBalanceQueryDocument, options);
      }
export function usePartyBalanceQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyBalanceQueryQuery, PartyBalanceQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyBalanceQueryQuery, PartyBalanceQueryQueryVariables>(PartyBalanceQueryDocument, options);
        }
export type PartyBalanceQueryQueryHookResult = ReturnType<typeof usePartyBalanceQueryQuery>;
export type PartyBalanceQueryLazyQueryHookResult = ReturnType<typeof usePartyBalanceQueryLazyQuery>;
export type PartyBalanceQueryQueryResult = Apollo.QueryResult<PartyBalanceQueryQuery, PartyBalanceQueryQueryVariables>;