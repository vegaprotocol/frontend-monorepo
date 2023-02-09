import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RewardFieldsFragment = { __typename?: 'Reward', rewardType: Types.AccountType, amount: string, percentageOfTotal: string, receivedAt: any, asset: { __typename?: 'Asset', id: string, symbol: string }, party: { __typename?: 'Party', id: string }, epoch: { __typename?: 'Epoch', id: string } };

export type DelegationFieldsFragment = { __typename?: 'Delegation', amount: string, epoch: number };

export type RewardsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  delegationsPagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type RewardsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, rewardsConnection?: { __typename?: 'RewardsConnection', edges?: Array<{ __typename?: 'RewardEdge', node: { __typename?: 'Reward', rewardType: Types.AccountType, amount: string, percentageOfTotal: string, receivedAt: any, asset: { __typename?: 'Asset', id: string, symbol: string }, party: { __typename?: 'Party', id: string }, epoch: { __typename?: 'Epoch', id: string } } } | null> | null } | null, delegationsConnection?: { __typename?: 'DelegationsConnection', edges?: Array<{ __typename?: 'DelegationEdge', node: { __typename?: 'Delegation', amount: string, epoch: number } } | null> | null } | null } | null, epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } } };

export type EpochRewardSummaryFieldsFragment = { __typename?: 'EpochRewardSummary', epoch: number, assetId: string, amount: string, rewardType: Types.AccountType };

export type EpochAssetsRewardsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type EpochAssetsRewardsQuery = { __typename?: 'Query', assetsConnection?: { __typename?: 'AssetsConnection', edges?: Array<{ __typename?: 'AssetEdge', node: { __typename?: 'Asset', id: string, name: string } } | null> | null } | null, epochRewardSummaries?: { __typename?: 'EpochRewardSummaryConnection', edges?: Array<{ __typename?: 'EpochRewardSummaryEdge', node: { __typename?: 'EpochRewardSummary', epoch: number, assetId: string, amount: string, rewardType: Types.AccountType } } | null> | null } | null, epoch: { __typename?: 'Epoch', timestamps: { __typename?: 'EpochTimestamps', expiry?: any | null } } };

export type EpochFieldsFragment = { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } };

export type EpochQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type EpochQuery = { __typename?: 'Query', epoch: { __typename?: 'Epoch', id: string, timestamps: { __typename?: 'EpochTimestamps', start?: any | null, end?: any | null, expiry?: any | null } } };

export const RewardFieldsFragmentDoc = gql`
    fragment RewardFields on Reward {
  rewardType
  asset {
    id
    symbol
  }
  party {
    id
  }
  epoch {
    id
  }
  amount
  percentageOfTotal
  receivedAt
}
    `;
export const DelegationFieldsFragmentDoc = gql`
    fragment DelegationFields on Delegation {
  amount
  epoch
}
    `;
export const EpochRewardSummaryFieldsFragmentDoc = gql`
    fragment EpochRewardSummaryFields on EpochRewardSummary {
  epoch
  assetId
  amount
  rewardType
}
    `;
export const EpochFieldsFragmentDoc = gql`
    fragment EpochFields on Epoch {
  id
  timestamps {
    start
    end
    expiry
  }
}
    `;
export const RewardsDocument = gql`
    query Rewards($partyId: ID!, $delegationsPagination: Pagination) {
  party(id: $partyId) {
    id
    rewardsConnection {
      edges {
        node {
          ...RewardFields
        }
      }
    }
    delegationsConnection(pagination: $delegationsPagination) {
      edges {
        node {
          ...DelegationFields
        }
      }
    }
  }
  epoch {
    id
    timestamps {
      start
      end
      expiry
    }
  }
}
    ${RewardFieldsFragmentDoc}
${DelegationFieldsFragmentDoc}`;

/**
 * __useRewardsQuery__
 *
 * To run a query within a React component, call `useRewardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRewardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRewardsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      delegationsPagination: // value for 'delegationsPagination'
 *   },
 * });
 */
export function useRewardsQuery(baseOptions: Apollo.QueryHookOptions<RewardsQuery, RewardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RewardsQuery, RewardsQueryVariables>(RewardsDocument, options);
      }
export function useRewardsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RewardsQuery, RewardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RewardsQuery, RewardsQueryVariables>(RewardsDocument, options);
        }
export type RewardsQueryHookResult = ReturnType<typeof useRewardsQuery>;
export type RewardsLazyQueryHookResult = ReturnType<typeof useRewardsLazyQuery>;
export type RewardsQueryResult = Apollo.QueryResult<RewardsQuery, RewardsQueryVariables>;
export const EpochAssetsRewardsDocument = gql`
    query EpochAssetsRewards {
  assetsConnection {
    edges {
      node {
        id
        name
      }
    }
  }
  epochRewardSummaries {
    edges {
      node {
        ...EpochRewardSummaryFields
      }
    }
  }
  epoch {
    timestamps {
      expiry
    }
  }
}
    ${EpochRewardSummaryFieldsFragmentDoc}`;

/**
 * __useEpochAssetsRewardsQuery__
 *
 * To run a query within a React component, call `useEpochAssetsRewardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEpochAssetsRewardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEpochAssetsRewardsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEpochAssetsRewardsQuery(baseOptions?: Apollo.QueryHookOptions<EpochAssetsRewardsQuery, EpochAssetsRewardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EpochAssetsRewardsQuery, EpochAssetsRewardsQueryVariables>(EpochAssetsRewardsDocument, options);
      }
export function useEpochAssetsRewardsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EpochAssetsRewardsQuery, EpochAssetsRewardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EpochAssetsRewardsQuery, EpochAssetsRewardsQueryVariables>(EpochAssetsRewardsDocument, options);
        }
export type EpochAssetsRewardsQueryHookResult = ReturnType<typeof useEpochAssetsRewardsQuery>;
export type EpochAssetsRewardsLazyQueryHookResult = ReturnType<typeof useEpochAssetsRewardsLazyQuery>;
export type EpochAssetsRewardsQueryResult = Apollo.QueryResult<EpochAssetsRewardsQuery, EpochAssetsRewardsQueryVariables>;
export const EpochDocument = gql`
    query Epoch {
  epoch {
    ...EpochFields
  }
}
    ${EpochFieldsFragmentDoc}`;

/**
 * __useEpochQuery__
 *
 * To run a query within a React component, call `useEpochQuery` and pass it any options that fit your needs.
 * When your component renders, `useEpochQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEpochQuery({
 *   variables: {
 *   },
 * });
 */
export function useEpochQuery(baseOptions?: Apollo.QueryHookOptions<EpochQuery, EpochQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EpochQuery, EpochQueryVariables>(EpochDocument, options);
      }
export function useEpochLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EpochQuery, EpochQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EpochQuery, EpochQueryVariables>(EpochDocument, options);
        }
export type EpochQueryHookResult = ReturnType<typeof useEpochQuery>;
export type EpochLazyQueryHookResult = ReturnType<typeof useEpochLazyQuery>;
export type EpochQueryResult = Apollo.QueryResult<EpochQuery, EpochQueryVariables>;