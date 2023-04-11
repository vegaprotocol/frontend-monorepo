import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProtocolUpgradeProposalFieldsFragment = { __typename?: 'ProtocolUpgradeProposal', upgradeBlockHeight: string, vegaReleaseTag: string, approvers: Array<string>, status: Types.ProtocolUpgradeProposalStatus };

export type ProtocolUpgradesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProtocolUpgradesQuery = { __typename?: 'Query', lastBlockHeight: string, protocolUpgradeProposals?: { __typename?: 'ProtocolUpgradeProposalConnection', edges?: Array<{ __typename?: 'ProtocolUpgradeProposalEdge', node: { __typename?: 'ProtocolUpgradeProposal', upgradeBlockHeight: string, vegaReleaseTag: string, approvers: Array<string>, status: Types.ProtocolUpgradeProposalStatus } }> | null } | null };

export const ProtocolUpgradeProposalFieldsFragmentDoc = gql`
    fragment ProtocolUpgradeProposalFields on ProtocolUpgradeProposal {
  upgradeBlockHeight
  vegaReleaseTag
  approvers
  status
}
    `;
export const ProtocolUpgradesDocument = gql`
    query ProtocolUpgrades {
  lastBlockHeight
  protocolUpgradeProposals {
    edges {
      node {
        ...ProtocolUpgradeProposalFields
      }
    }
  }
}
    ${ProtocolUpgradeProposalFieldsFragmentDoc}`;

/**
 * __useProtocolUpgradesQuery__
 *
 * To run a query within a React component, call `useProtocolUpgradesQuery` and pass it any options that fit your needs.
 * When your component renders, `useProtocolUpgradesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProtocolUpgradesQuery({
 *   variables: {
 *   },
 * });
 */
export function useProtocolUpgradesQuery(baseOptions?: Apollo.QueryHookOptions<ProtocolUpgradesQuery, ProtocolUpgradesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProtocolUpgradesQuery, ProtocolUpgradesQueryVariables>(ProtocolUpgradesDocument, options);
      }
export function useProtocolUpgradesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProtocolUpgradesQuery, ProtocolUpgradesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProtocolUpgradesQuery, ProtocolUpgradesQueryVariables>(ProtocolUpgradesDocument, options);
        }
export type ProtocolUpgradesQueryHookResult = ReturnType<typeof useProtocolUpgradesQuery>;
export type ProtocolUpgradesLazyQueryHookResult = ReturnType<typeof useProtocolUpgradesLazyQuery>;
export type ProtocolUpgradesQueryResult = Apollo.QueryResult<ProtocolUpgradesQuery, ProtocolUpgradesQueryVariables>;