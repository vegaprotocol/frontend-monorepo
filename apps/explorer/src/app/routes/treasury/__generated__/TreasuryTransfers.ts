import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerTreasuryTransfersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerTreasuryTransfersQuery = { __typename?: 'Query', transfersConnection?: { __typename?: 'TransferConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges?: Array<{ __typename?: 'TransferEdge', node: { __typename?: 'TransferNode', transfer: { __typename?: 'Transfer', timestamp: any, from: string, amount: string, to: string, status: Types.TransferStatus, reason?: string | null, toAccountType: Types.AccountType, fromAccountType: Types.AccountType, id: string, asset?: { __typename?: 'Asset', id: string } | null, kind: { __typename?: 'OneOffGovernanceTransfer', deliverOn?: any | null } | { __typename?: 'OneOffTransfer', deliverOn?: any | null } | { __typename?: 'RecurringGovernanceTransfer', endEpoch?: number | null } | { __typename?: 'RecurringTransfer', startEpoch: number } } } } | null> | null } | null };


export const ExplorerTreasuryTransfersDocument = gql`
    query ExplorerTreasuryTransfers {
  transfersConnection(
    partyId: "network"
    direction: ToOrFrom
    pagination: {last: 200}
  ) {
    pageInfo {
      hasNextPage
    }
    edges {
      node {
        transfer {
          timestamp
          from
          amount
          to
          status
          reason
          toAccountType
          fromAccountType
          asset {
            id
          }
          id
          status
          kind {
            ... on OneOffTransfer {
              deliverOn
            }
            ... on RecurringTransfer {
              startEpoch
            }
            ... on OneOffGovernanceTransfer {
              deliverOn
            }
            ... on RecurringGovernanceTransfer {
              endEpoch
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useExplorerTreasuryTransfersQuery__
 *
 * To run a query within a React component, call `useExplorerTreasuryTransfersQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerTreasuryTransfersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerTreasuryTransfersQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerTreasuryTransfersQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerTreasuryTransfersQuery, ExplorerTreasuryTransfersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerTreasuryTransfersQuery, ExplorerTreasuryTransfersQueryVariables>(ExplorerTreasuryTransfersDocument, options);
      }
export function useExplorerTreasuryTransfersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerTreasuryTransfersQuery, ExplorerTreasuryTransfersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerTreasuryTransfersQuery, ExplorerTreasuryTransfersQueryVariables>(ExplorerTreasuryTransfersDocument, options);
        }
export type ExplorerTreasuryTransfersQueryHookResult = ReturnType<typeof useExplorerTreasuryTransfersQuery>;
export type ExplorerTreasuryTransfersLazyQueryHookResult = ReturnType<typeof useExplorerTreasuryTransfersLazyQuery>;
export type ExplorerTreasuryTransfersQueryResult = Apollo.QueryResult<ExplorerTreasuryTransfersQuery, ExplorerTreasuryTransfersQueryVariables>;