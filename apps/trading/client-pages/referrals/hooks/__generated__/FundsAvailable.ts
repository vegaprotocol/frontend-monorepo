import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FundsAvailableQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type FundsAvailableQuery = { __typename?: 'Query', party?: { __typename?: 'Party', accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', balance: string, asset: { __typename?: 'Asset', decimals: number, symbol: string, id: string } } } | null> | null } | null } | null, networkParameter?: { __typename?: 'NetworkParameter', key: string, value: string } | null };


export const FundsAvailableDocument = gql`
    query FundsAvailable($partyId: ID!) {
  party(id: $partyId) {
    accountsConnection {
      edges {
        node {
          balance
          asset {
            decimals
            symbol
            id
          }
        }
      }
    }
  }
  networkParameter(key: "spam.protection.applyReferral.min.funds") {
    key
    value
  }
}
    `;

/**
 * __useFundsAvailableQuery__
 *
 * To run a query within a React component, call `useFundsAvailableQuery` and pass it any options that fit your needs.
 * When your component renders, `useFundsAvailableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFundsAvailableQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useFundsAvailableQuery(baseOptions: Apollo.QueryHookOptions<FundsAvailableQuery, FundsAvailableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FundsAvailableQuery, FundsAvailableQueryVariables>(FundsAvailableDocument, options);
      }
export function useFundsAvailableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FundsAvailableQuery, FundsAvailableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FundsAvailableQuery, FundsAvailableQueryVariables>(FundsAvailableDocument, options);
        }
export type FundsAvailableQueryHookResult = ReturnType<typeof useFundsAvailableQuery>;
export type FundsAvailableLazyQueryHookResult = ReturnType<typeof useFundsAvailableLazyQuery>;
export type FundsAvailableQueryResult = Apollo.QueryResult<FundsAvailableQuery, FundsAvailableQueryVariables>;