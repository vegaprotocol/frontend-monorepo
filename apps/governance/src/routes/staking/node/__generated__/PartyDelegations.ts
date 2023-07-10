import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type StakingDelegationsFieldsFragment = { __typename: 'Delegation', amount: string, epoch: number, node: { __typename: 'Node', id: string } };

export type PartyDelegationsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  delegationsPagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type PartyDelegationsQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, delegationsConnection?: { __typename: 'DelegationsConnection', edges?: Array<{ __typename: 'DelegationEdge', node: { __typename: 'Delegation', amount: string, epoch: number, node: { __typename: 'Node', id: string } } } | null> | null } | null } | null, epoch: { __typename: 'Epoch', id: string } };

export const StakingDelegationsFieldsFragmentDoc = gql`
    fragment StakingDelegationsFields on Delegation {
  amount
  node {
    id
  }
  epoch
}
    `;
export const PartyDelegationsDocument = gql`
    query PartyDelegations($partyId: ID!, $delegationsPagination: Pagination) {
  party(id: $partyId) {
    id
    delegationsConnection(pagination: $delegationsPagination) {
      edges {
        node {
          ...StakingDelegationsFields
        }
      }
    }
  }
  epoch {
    id
  }
}
    ${StakingDelegationsFieldsFragmentDoc}`;

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
 *      delegationsPagination: // value for 'delegationsPagination'
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