import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyProfilesQueryVariables = Types.Exact<{
  partyIds?: Types.InputMaybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>;
}>;


export type PartyProfilesQuery = { __typename?: 'Query', partiesProfilesConnection?: { __typename?: 'PartiesProfilesConnection', edges: Array<{ __typename?: 'PartyProfileEdge', node: { __typename?: 'PartyProfile', partyId: string, alias: string, metadata: Array<{ __typename?: 'Metadata', key: string, value: string }> } }> } | null };


export const PartyProfilesDocument = gql`
    query PartyProfiles($partyIds: [ID!]) {
  partiesProfilesConnection(ids: $partyIds) {
    edges {
      node {
        partyId
        alias
        metadata {
          key
          value
        }
      }
    }
  }
}
    `;

/**
 * __usePartyProfilesQuery__
 *
 * To run a query within a React component, call `usePartyProfilesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyProfilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyProfilesQuery({
 *   variables: {
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function usePartyProfilesQuery(baseOptions?: Apollo.QueryHookOptions<PartyProfilesQuery, PartyProfilesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyProfilesQuery, PartyProfilesQueryVariables>(PartyProfilesDocument, options);
      }
export function usePartyProfilesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyProfilesQuery, PartyProfilesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyProfilesQuery, PartyProfilesQueryVariables>(PartyProfilesDocument, options);
        }
export type PartyProfilesQueryHookResult = ReturnType<typeof usePartyProfilesQuery>;
export type PartyProfilesLazyQueryHookResult = ReturnType<typeof usePartyProfilesLazyQuery>;
export type PartyProfilesQueryResult = Apollo.QueryResult<PartyProfilesQuery, PartyProfilesQueryVariables>;