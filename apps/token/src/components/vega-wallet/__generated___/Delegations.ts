import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DelegationsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DelegationsQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string }, party?: { __typename?: 'Party', id: string, delegations?: Array<{ __typename?: 'Delegation', amountFormatted: string, amount: string, epoch: number, node: { __typename?: 'Node', id: string, name: string } }> | null, stake: { __typename?: 'PartyStake', currentStakeAvailable: string, currentStakeAvailableFormatted: string }, accounts?: Array<{ __typename?: 'Account', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', name: string, id: string, decimals: number, symbol: string, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } }> | null } | null };


export const DelegationsDocument = gql`
    query Delegations($partyId: ID!) {
  epoch {
    id
  }
  party(id: $partyId) {
    id
    delegations {
      amountFormatted @client
      amount
      node {
        id
        name
      }
      epoch
    }
    stake {
      currentStakeAvailable
      currentStakeAvailableFormatted @client
    }
    accounts {
      asset {
        name
        id
        decimals
        symbol
        source {
          __typename
          ... on ERC20 {
            contractAddress
          }
        }
      }
      type
      balance
    }
  }
}
    `;

/**
 * __useDelegationsQuery__
 *
 * To run a query within a React component, call `useDelegationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDelegationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDelegationsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useDelegationsQuery(baseOptions: Apollo.QueryHookOptions<DelegationsQuery, DelegationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DelegationsQuery, DelegationsQueryVariables>(DelegationsDocument, options);
      }
export function useDelegationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DelegationsQuery, DelegationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DelegationsQuery, DelegationsQueryVariables>(DelegationsDocument, options);
        }
export type DelegationsQueryHookResult = ReturnType<typeof useDelegationsQuery>;
export type DelegationsLazyQueryHookResult = ReturnType<typeof useDelegationsLazyQuery>;
export type DelegationsQueryResult = Apollo.QueryResult<DelegationsQuery, DelegationsQueryVariables>;