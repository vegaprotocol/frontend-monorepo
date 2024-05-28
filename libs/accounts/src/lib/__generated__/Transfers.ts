import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import { AssetFieldsFragmentDoc } from '../../../../assets/src/lib/__generated__/Asset';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TransferFieldsFragment = { __typename?: 'Transfer', amount: string, id: string, from: string, fromAccountType: Types.AccountType, to: string, toAccountType: Types.AccountType, reference?: string | null, status: Types.TransferStatus, timestamp: any, asset?: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null } | null };

export type TransfersQueryVariables = Types.Exact<{
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type TransfersQuery = { __typename?: 'Query', transfersConnection?: { __typename?: 'TransferConnection', edges?: Array<{ __typename?: 'TransferEdge', cursor: string, node: { __typename?: 'TransferNode', transfer: { __typename?: 'Transfer', amount: string, id: string, from: string, fromAccountType: Types.AccountType, to: string, toAccountType: Types.AccountType, reference?: string | null, status: Types.TransferStatus, timestamp: any, asset?: { __typename?: 'Asset', id: string, name: string, symbol: string, decimals: number, quantum: string, status: Types.AssetStatus, source: { __typename: 'BuiltinAsset', maxFaucetAmountMint: string } | { __typename: 'ERC20', contractAddress: string, lifetimeLimit: string, withdrawThreshold: string }, networkTreasuryAccount?: { __typename?: 'AccountBalance', balance: string } | null, globalInsuranceAccount?: { __typename?: 'AccountBalance', balance: string } | null } | null } } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string, endCursor: string } } | null };

export const TransferFieldsFragmentDoc = gql`
    fragment TransferFields on Transfer {
  amount
  id
  from
  fromAccountType
  to
  toAccountType
  asset {
    ...AssetFields
  }
  reference
  status
  timestamp
}
    ${AssetFieldsFragmentDoc}`;
export const TransfersDocument = gql`
    query Transfers($partyId: ID, $pagination: Pagination) {
  transfersConnection(
    partyId: $partyId
    direction: ToOrFrom
    pagination: $pagination
  ) {
    edges {
      node {
        transfer {
          ...TransferFields
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    ${TransferFieldsFragmentDoc}`;

/**
 * __useTransfersQuery__
 *
 * To run a query within a React component, call `useTransfersQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransfersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransfersQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useTransfersQuery(baseOptions?: Apollo.QueryHookOptions<TransfersQuery, TransfersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TransfersQuery, TransfersQueryVariables>(TransfersDocument, options);
      }
export function useTransfersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TransfersQuery, TransfersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TransfersQuery, TransfersQueryVariables>(TransfersDocument, options);
        }
export type TransfersQueryHookResult = ReturnType<typeof useTransfersQuery>;
export type TransfersLazyQueryHookResult = ReturnType<typeof useTransfersLazyQuery>;
export type TransfersQueryResult = Apollo.QueryResult<TransfersQuery, TransfersQueryVariables>;