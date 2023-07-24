import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LiquidityProvisionFieldsFragment = { __typename?: 'LiquidityProvision', id: string, createdAt: any, updatedAt?: any | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string } } | null> | null } | null } };

export type LiquidityProvisionsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type LiquidityProvisionsQuery = { __typename?: 'Query', market?: { __typename?: 'Market', liquidityProvisionsConnection?: { __typename?: 'LiquidityProvisionsConnection', edges?: Array<{ __typename?: 'LiquidityProvisionsEdge', node: { __typename?: 'LiquidityProvision', id: string, createdAt: any, updatedAt?: any | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string } } | null> | null } | null } } } | null> | null } | null } | null };

export type LiquidityProvisionsUpdateSubscriptionVariables = Types.Exact<{
  partyId?: Types.InputMaybe<Types.Scalars['ID']>;
  marketId?: Types.InputMaybe<Types.Scalars['ID']>;
}>;


export type LiquidityProvisionsUpdateSubscription = { __typename?: 'Subscription', liquidityProvisions?: Array<{ __typename?: 'LiquidityProvisionUpdate', id: string, partyID: string, createdAt: any, updatedAt?: any | null, marketID: string, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus }> | null };

export type LiquidityProviderFeeShareFieldsFragment = { __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, party: { __typename?: 'Party', id: string } };

export type LiquidityProviderFeeShareQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type LiquidityProviderFeeShareQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, data?: { __typename?: 'MarketData', market: { __typename?: 'Market', id: string }, liquidityProviderFeeShare?: Array<{ __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, party: { __typename?: 'Party', id: string } }> | null } | null } | null };

export const LiquidityProvisionFieldsFragmentDoc = gql`
    fragment LiquidityProvisionFields on LiquidityProvision {
  id
  party {
    id
    accountsConnection(marketId: $marketId, type: ACCOUNT_TYPE_BOND) {
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
  party {
    id
  }
  equityLikeShare
  averageEntryValuation
}
    `;
export const LiquidityProvisionsDocument = gql`
    query LiquidityProvisions($marketId: ID!) {
  market(id: $marketId) {
    liquidityProvisionsConnection(live: true) {
      edges {
        node {
          ...LiquidityProvisionFields
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
export const LiquidityProvisionsUpdateDocument = gql`
    subscription LiquidityProvisionsUpdate($partyId: ID, $marketId: ID) {
  liquidityProvisions(partyId: $partyId, marketId: $marketId) {
    id
    partyID
    createdAt
    updatedAt
    marketID
    commitmentAmount
    fee
    status
  }
}
    `;

/**
 * __useLiquidityProvisionsUpdateSubscription__
 *
 * To run a query within a React component, call `useLiquidityProvisionsUpdateSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLiquidityProvisionsUpdateSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidityProvisionsUpdateSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useLiquidityProvisionsUpdateSubscription(baseOptions?: Apollo.SubscriptionHookOptions<LiquidityProvisionsUpdateSubscription, LiquidityProvisionsUpdateSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<LiquidityProvisionsUpdateSubscription, LiquidityProvisionsUpdateSubscriptionVariables>(LiquidityProvisionsUpdateDocument, options);
      }
export type LiquidityProvisionsUpdateSubscriptionHookResult = ReturnType<typeof useLiquidityProvisionsUpdateSubscription>;
export type LiquidityProvisionsUpdateSubscriptionResult = Apollo.SubscriptionResult<LiquidityProvisionsUpdateSubscription>;
export const LiquidityProviderFeeShareDocument = gql`
    query LiquidityProviderFeeShare($marketId: ID!) {
  market(id: $marketId) {
    id
    data {
      market {
        id
      }
      liquidityProviderFeeShare {
        ...LiquidityProviderFeeShareFields
      }
    }
  }
}
    ${LiquidityProviderFeeShareFieldsFragmentDoc}`;

/**
 * __useLiquidityProviderFeeShareQuery__
 *
 * To run a query within a React component, call `useLiquidityProviderFeeShareQuery` and pass it any options that fit your needs.
 * When your component renders, `useLiquidityProviderFeeShareQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidityProviderFeeShareQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useLiquidityProviderFeeShareQuery(baseOptions: Apollo.QueryHookOptions<LiquidityProviderFeeShareQuery, LiquidityProviderFeeShareQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LiquidityProviderFeeShareQuery, LiquidityProviderFeeShareQueryVariables>(LiquidityProviderFeeShareDocument, options);
      }
export function useLiquidityProviderFeeShareLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LiquidityProviderFeeShareQuery, LiquidityProviderFeeShareQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LiquidityProviderFeeShareQuery, LiquidityProviderFeeShareQueryVariables>(LiquidityProviderFeeShareDocument, options);
        }
export type LiquidityProviderFeeShareQueryHookResult = ReturnType<typeof useLiquidityProviderFeeShareQuery>;
export type LiquidityProviderFeeShareLazyQueryHookResult = ReturnType<typeof useLiquidityProviderFeeShareLazyQuery>;
export type LiquidityProviderFeeShareQueryResult = Apollo.QueryResult<LiquidityProviderFeeShareQuery, LiquidityProviderFeeShareQueryVariables>;