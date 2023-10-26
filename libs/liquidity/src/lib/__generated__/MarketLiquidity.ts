import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LiquidityProvisionFieldsFragment = { __typename?: 'LiquidityProvision', id: string, createdAt: any, updatedAt?: any | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string } } | null> | null } | null } };

export type LiquidityProvisionsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type LiquidityProvisionsQuery = { __typename?: 'Query', market?: { __typename?: 'Market', liquidityProvisions?: { __typename?: 'LiquidityProvisionsWithPendingConnection', edges?: Array<{ __typename?: 'LiquidityProvisionWithPendingEdge', node: { __typename?: 'LiquidityProvisionWithPending', current: { __typename?: 'LiquidityProvision', id: string, createdAt: any, updatedAt?: any | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string } } | null> | null } | null } }, pending?: { __typename?: 'LiquidityProvision', id: string, createdAt: any, updatedAt?: any | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string } } | null> | null } | null } } | null } } | null> | null } | null } | null };

export type LiquidityProviderFeeShareFieldsFragment = { __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, averageScore: string, virtualStake: string };

export type LiquidityProviderSLAFieldsFragment = { __typename?: 'LiquidityProviderSLA', currentEpochFractionOfTimeOnBook: string, lastEpochFractionOfTimeOnBook: string, lastEpochFeePenalty: string, lastEpochBondPenalty: string, hysteresisPeriodFeePenalties?: Array<string> | null, requiredLiquidity: string, notionalVolumeBuys: string, notionalVolumeSells: string };

export type LiquidityProvidersQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type LiquidityProvidersQuery = { __typename?: 'Query', liquidityProviders?: { __typename?: 'LiquidityProviderConnection', edges: Array<{ __typename?: 'LiquidityProviderEdge', node: { __typename?: 'LiquidityProvider', partyId: string, marketId: string, feeShare?: { __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, averageScore: string, virtualStake: string } | null, sla?: { __typename?: 'LiquidityProviderSLA', currentEpochFractionOfTimeOnBook: string, lastEpochFractionOfTimeOnBook: string, lastEpochFeePenalty: string, lastEpochBondPenalty: string, hysteresisPeriodFeePenalties?: Array<string> | null, requiredLiquidity: string, notionalVolumeBuys: string, notionalVolumeSells: string } | null } }> } | null };

export type LiquidityProviderFieldsFragment = { __typename?: 'LiquidityProvider', partyId: string, marketId: string, feeShare?: { __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, averageScore: string, virtualStake: string } | null, sla?: { __typename?: 'LiquidityProviderSLA', currentEpochFractionOfTimeOnBook: string, lastEpochFractionOfTimeOnBook: string, lastEpochFeePenalty: string, lastEpochBondPenalty: string, hysteresisPeriodFeePenalties?: Array<string> | null, requiredLiquidity: string, notionalVolumeBuys: string, notionalVolumeSells: string } | null };

export const LiquidityProvisionFieldsFragmentDoc = gql`
    fragment LiquidityProvisionFields on LiquidityProvision {
  id
  party {
    id
    accountsConnection(marketId: $marketId) {
      edges {
        node {
          type
          balance
        }
      }
    }
  }
  createdAt
  updatedAt
  commitmentAmount
  fee
  status
}
    `;
export const LiquidityProviderFeeShareFieldsFragmentDoc = gql`
    fragment LiquidityProviderFeeShareFields on LiquidityProviderFeeShare {
  equityLikeShare
  averageEntryValuation
  averageScore
  virtualStake
}
    `;
export const LiquidityProviderSLAFieldsFragmentDoc = gql`
    fragment LiquidityProviderSLAFields on LiquidityProviderSLA {
  currentEpochFractionOfTimeOnBook
  lastEpochFractionOfTimeOnBook
  lastEpochFeePenalty
  lastEpochBondPenalty
  hysteresisPeriodFeePenalties
  requiredLiquidity
  notionalVolumeBuys
  notionalVolumeSells
}
    `;
export const LiquidityProviderFieldsFragmentDoc = gql`
    fragment LiquidityProviderFields on LiquidityProvider {
  partyId
  marketId
  feeShare {
    ...LiquidityProviderFeeShareFields
  }
  sla {
    ...LiquidityProviderSLAFields
  }
}
    ${LiquidityProviderFeeShareFieldsFragmentDoc}
${LiquidityProviderSLAFieldsFragmentDoc}`;
export const LiquidityProvisionsDocument = gql`
    query LiquidityProvisions($marketId: ID!) {
  market(id: $marketId) {
    liquidityProvisions(live: true) {
      edges {
        node {
          current {
            ...LiquidityProvisionFields
          }
          pending {
            ...LiquidityProvisionFields
          }
        }
      }
    }
  }
}
    ${LiquidityProvisionFieldsFragmentDoc}`;

/**
 * __useLiquidityProvisionsQuery__
 *
 * To run a query within a React component, call `useLiquidityProvisionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLiquidityProvisionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidityProvisionsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useLiquidityProvisionsQuery(baseOptions: Apollo.QueryHookOptions<LiquidityProvisionsQuery, LiquidityProvisionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LiquidityProvisionsQuery, LiquidityProvisionsQueryVariables>(LiquidityProvisionsDocument, options);
      }
export function useLiquidityProvisionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LiquidityProvisionsQuery, LiquidityProvisionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LiquidityProvisionsQuery, LiquidityProvisionsQueryVariables>(LiquidityProvisionsDocument, options);
        }
export type LiquidityProvisionsQueryHookResult = ReturnType<typeof useLiquidityProvisionsQuery>;
export type LiquidityProvisionsLazyQueryHookResult = ReturnType<typeof useLiquidityProvisionsLazyQuery>;
export type LiquidityProvisionsQueryResult = Apollo.QueryResult<LiquidityProvisionsQuery, LiquidityProvisionsQueryVariables>;
export const LiquidityProvidersDocument = gql`
    query LiquidityProviders($marketId: ID!) {
  liquidityProviders(marketId: $marketId) {
    edges {
      node {
        ...LiquidityProviderFields
      }
    }
  }
}
    ${LiquidityProviderFieldsFragmentDoc}`;

/**
 * __useLiquidityProvidersQuery__
 *
 * To run a query within a React component, call `useLiquidityProvidersQuery` and pass it any options that fit your needs.
 * When your component renders, `useLiquidityProvidersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidityProvidersQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useLiquidityProvidersQuery(baseOptions: Apollo.QueryHookOptions<LiquidityProvidersQuery, LiquidityProvidersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LiquidityProvidersQuery, LiquidityProvidersQueryVariables>(LiquidityProvidersDocument, options);
      }
export function useLiquidityProvidersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LiquidityProvidersQuery, LiquidityProvidersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LiquidityProvidersQuery, LiquidityProvidersQueryVariables>(LiquidityProvidersDocument, options);
        }
export type LiquidityProvidersQueryHookResult = ReturnType<typeof useLiquidityProvidersQuery>;
export type LiquidityProvidersLazyQueryHookResult = ReturnType<typeof useLiquidityProvidersLazyQuery>;
export type LiquidityProvidersQueryResult = Apollo.QueryResult<LiquidityProvidersQuery, LiquidityProvidersQueryVariables>;