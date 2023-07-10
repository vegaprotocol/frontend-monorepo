import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LinkingsFieldsFragment = { __typename: 'StakeLinking', id: string, txHash: string, status: Types.StakeLinkingStatus };

export type PartyStakeLinkingsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyStakeLinkingsQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, stakingSummary: { __typename: 'StakingSummary', linkings: { __typename: 'StakesConnection', edges?: Array<{ __typename: 'StakeLinkingEdge', node: { __typename: 'StakeLinking', id: string, txHash: string, status: Types.StakeLinkingStatus } } | null> | null } } } | null };

export const LinkingsFieldsFragmentDoc = gql`
    fragment LinkingsFields on StakeLinking {
  id
  txHash
  status
}
    `;
export const PartyStakeLinkingsDocument = gql`
    query PartyStakeLinkings($partyId: ID!) {
  party(id: $partyId) {
    id
    stakingSummary {
      linkings {
        edges {
          node {
            ...LinkingsFields
          }
        }
      }
    }
  }
}
    ${LinkingsFieldsFragmentDoc}`;

/**
 * __usePartyStakeLinkingsQuery__
 *
 * To run a query within a React component, call `usePartyStakeLinkingsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyStakeLinkingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyStakeLinkingsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyStakeLinkingsQuery(baseOptions: Apollo.QueryHookOptions<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>(PartyStakeLinkingsDocument, options);
      }
export function usePartyStakeLinkingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>(PartyStakeLinkingsDocument, options);
        }
export type PartyStakeLinkingsQueryHookResult = ReturnType<typeof usePartyStakeLinkingsQuery>;
export type PartyStakeLinkingsLazyQueryHookResult = ReturnType<typeof usePartyStakeLinkingsLazyQuery>;
export type PartyStakeLinkingsQueryResult = Apollo.QueryResult<PartyStakeLinkingsQuery, PartyStakeLinkingsQueryVariables>;