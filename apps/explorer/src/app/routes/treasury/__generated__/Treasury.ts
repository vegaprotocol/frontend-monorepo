import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerTreasuryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type ExplorerTreasuryQuery = { __typename?: 'Query', party?: { __typename?: 'Party', accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string }, market?: { __typename?: 'Market', id: string, state: Types.MarketState } | null } } | null> | null } | null } | null };


export const ExplorerTreasuryDocument = gql`
    query ExplorerTreasury($partyId: ID!) {
  party(id: $partyId) {
    accountsConnection {
      edges {
        node {
          type
          asset {
            id
          }
          market {
            id
            state
          }
          balance
        }
      }
    }
  }
}
    `;

/**
 * __useExplorerTreasuryQuery__
 *
 * To run a query within a React component, call `useExplorerTreasuryQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerTreasuryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerTreasuryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useExplorerTreasuryQuery(baseOptions: Apollo.QueryHookOptions<ExplorerTreasuryQuery, ExplorerTreasuryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerTreasuryQuery, ExplorerTreasuryQueryVariables>(ExplorerTreasuryDocument, options);
      }
export function useExplorerTreasuryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerTreasuryQuery, ExplorerTreasuryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerTreasuryQuery, ExplorerTreasuryQueryVariables>(ExplorerTreasuryDocument, options);
        }
export type ExplorerTreasuryQueryHookResult = ReturnType<typeof useExplorerTreasuryQuery>;
export type ExplorerTreasuryLazyQueryHookResult = ReturnType<typeof useExplorerTreasuryLazyQuery>;
export type ExplorerTreasuryQueryResult = Apollo.QueryResult<ExplorerTreasuryQuery, ExplorerTreasuryQueryVariables>;