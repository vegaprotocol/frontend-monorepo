import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProtocolUpgradeProposalFieldsFragment = { __typename: 'ProtocolUpgradeProposal', upgradeBlockHeight: string, vegaReleaseTag: string, approvers: Array<string>, status: Types.ProtocolUpgradeProposalStatus };

export type ProtocolUpgradeProposalsQueryVariables = Types.Exact<{
  inState?: Types.InputMaybe<Types.ProtocolUpgradeProposalStatus>;
}>;


export type ProtocolUpgradeProposalsQuery = { __typename: 'Query', lastBlockHeight: string, protocolUpgradeProposals?: { __typename: 'ProtocolUpgradeProposalConnection', edges?: Array<{ __typename: 'ProtocolUpgradeProposalEdge', node: { __typename: 'ProtocolUpgradeProposal', upgradeBlockHeight: string, vegaReleaseTag: string, approvers: Array<string>, status: Types.ProtocolUpgradeProposalStatus } }> | null } | null };

export const ProtocolUpgradeProposalFieldsFragmentDoc = gql`
    fragment ProtocolUpgradeProposalFields on ProtocolUpgradeProposal {
  upgradeBlockHeight
  vegaReleaseTag
  approvers
  status
}
    `;
export const ProtocolUpgradeProposalsDocument = gql`
    query ProtocolUpgradeProposals($inState: ProtocolUpgradeProposalStatus) {
  lastBlockHeight
  protocolUpgradeProposals(inState: $inState) {
    edges {
      node {
        ...ProtocolUpgradeProposalFields
      }
    }
  }
}
    ${ProtocolUpgradeProposalFieldsFragmentDoc}`;

/**
 * __useProtocolUpgradeProposalsQuery__
 *
 * To run a query within a React component, call `useProtocolUpgradeProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProtocolUpgradeProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProtocolUpgradeProposalsQuery({
 *   variables: {
 *      inState: // value for 'inState'
 *   },
 * });
 */
export function useProtocolUpgradeProposalsQuery(baseOptions?: Apollo.QueryHookOptions<ProtocolUpgradeProposalsQuery, ProtocolUpgradeProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProtocolUpgradeProposalsQuery, ProtocolUpgradeProposalsQueryVariables>(ProtocolUpgradeProposalsDocument, options);
      }
export function useProtocolUpgradeProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProtocolUpgradeProposalsQuery, ProtocolUpgradeProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProtocolUpgradeProposalsQuery, ProtocolUpgradeProposalsQueryVariables>(ProtocolUpgradeProposalsDocument, options);
        }
export type ProtocolUpgradeProposalsQueryHookResult = ReturnType<typeof useProtocolUpgradeProposalsQuery>;
export type ProtocolUpgradeProposalsLazyQueryHookResult = ReturnType<typeof useProtocolUpgradeProposalsLazyQuery>;
export type ProtocolUpgradeProposalsQueryResult = Apollo.QueryResult<ProtocolUpgradeProposalsQuery, ProtocolUpgradeProposalsQueryVariables>;