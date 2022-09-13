import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyDelegationsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyDelegationsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, delegations?: Array<{ __typename?: 'Delegation', amount: string, amountFormatted: string, epoch: number, node: { __typename?: 'Node', id: string } }> | null } | null, epoch: { __typename?: 'Epoch', id: string } };


export const PartyDelegationsDocument = gql`
    query PartyDelegations($partyId: ID!) {
  party(id: $partyId) {
    id
    delegations {
      amount
      amountFormatted @client
      node {
        id
      }
      epoch
    }
  }
  epoch {
    id
  }
}
    `;

/**
 * __usePartyDelegationsQuery__
 *
 * To run a query within a React component, call `usePartyDelegationsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyDelegationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyDelegationsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyDelegationsQuery(baseOptions: Apollo.QueryHookOptions<PartyDelegationsQuery, PartyDelegationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyDelegationsQuery, PartyDelegationsQueryVariables>(PartyDelegationsDocument, options);
      }
export function usePartyDelegationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyDelegationsQuery, PartyDelegationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyDelegationsQuery, PartyDelegationsQueryVariables>(PartyDelegationsDocument, options);
        }
export type PartyDelegationsQueryHookResult = ReturnType<typeof usePartyDelegationsQuery>;
export type PartyDelegationsLazyQueryHookResult = ReturnType<typeof usePartyDelegationsLazyQuery>;
export type PartyDelegationsQueryResult = Apollo.QueryResult<PartyDelegationsQuery, PartyDelegationsQueryVariables>;