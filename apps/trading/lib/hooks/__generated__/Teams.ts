import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TeamsFieldsFragment = { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean, totalMembers: number };

export type TeamsQueryVariables = Types.Exact<{
  teamId?: Types.InputMaybe<Types.Scalars['ID']>;
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  checkReferrals?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;


export type TeamsQuery = { __typename?: 'Query', teams?: { __typename?: 'TeamConnection', edges: Array<{ __typename?: 'TeamEdge', node: { __typename?: 'Team', teamId: string, referrer: string, name: string, teamUrl: string, avatarUrl: string, createdAt: any, createdAtEpoch: number, closed: boolean, totalMembers: number } }> } | null, referrer: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string } } | null> }, referee: { __typename?: 'ReferralSetConnection', edges: Array<{ __typename?: 'ReferralSetEdge', node: { __typename?: 'ReferralSet', id: string, referrer: string } } | null> } };

export const TeamsFieldsFragmentDoc = gql`
    fragment TeamsFields on Team {
  teamId
  referrer
  name
  teamUrl
  avatarUrl
  createdAt
  createdAtEpoch
  closed
  totalMembers
}
    `;
export const TeamsDocument = gql`
    query Teams($teamId: ID, $partyId: ID, $checkReferrals: Boolean = false) {
  teams(teamId: $teamId, partyId: $partyId) {
    edges {
      node {
        ...TeamsFields
      }
    }
  }
  referrer: referralSets(referrer: $partyId) @include(if: $checkReferrals) {
    edges {
      node {
        id
        referrer
      }
    }
  }
  referee: referralSets(referee: $partyId) @include(if: $checkReferrals) {
    edges {
      node {
        id
        referrer
      }
    }
  }
}
    ${TeamsFieldsFragmentDoc}`;

/**
 * __useTeamsQuery__
 *
 * To run a query within a React component, call `useTeamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTeamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTeamsQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      partyId: // value for 'partyId'
 *      checkReferrals: // value for 'checkReferrals'
 *   },
 * });
 */
export function useTeamsQuery(baseOptions?: Apollo.QueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, options);
      }
export function useTeamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TeamsQuery, TeamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TeamsQuery, TeamsQueryVariables>(TeamsDocument, options);
        }
export type TeamsQueryHookResult = ReturnType<typeof useTeamsQuery>;
export type TeamsLazyQueryHookResult = ReturnType<typeof useTeamsLazyQuery>;
export type TeamsQueryResult = Apollo.QueryResult<TeamsQuery, TeamsQueryVariables>;