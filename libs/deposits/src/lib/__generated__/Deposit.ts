import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DepositFieldsFragment = { __typename: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename: 'Asset', id: string, symbol: string, decimals: number } };

export type DepositsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DepositsQuery = { __typename: 'Query', party?: { __typename: 'Party', id: string, depositsConnection?: { __typename: 'DepositsConnection', edges?: Array<{ __typename: 'DepositEdge', node: { __typename: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename: 'Asset', id: string, symbol: string, decimals: number } } } | null> | null } | null } | null };

export type DepositEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DepositEventSubscription = { __typename: 'Subscription', busEvents?: Array<{ __typename: 'BusEvent', event: { __typename: 'Deposit', id: string, status: Types.DepositStatus, amount: string, createdTimestamp: any, creditedTimestamp?: any | null, txHash?: string | null, asset: { __typename: 'Asset', id: string, symbol: string, decimals: number } } | { __typename: 'TimeUpdate' } | { __typename: 'TransactionResult' } | { __typename: 'Withdrawal' } }> | null };

export const DepositFieldsFragmentDoc = gql`
    fragment DepositFields on Deposit {
  id
  status
  amount
  asset {
    id
    symbol
    decimals
  }
  createdTimestamp
  creditedTimestamp
  txHash
}
    `;
export const DepositsDocument = gql`
    query Deposits($partyId: ID!) {
  party(id: $partyId) {
    id
    depositsConnection {
      edges {
        node {
          ...DepositFields
        }
      }
    }
  }
}
    ${DepositFieldsFragmentDoc}`;

/**
 * __useDepositsQuery__
 *
 * To run a query within a React component, call `useDepositsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDepositsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useDepositsQuery(baseOptions: Apollo.QueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
      }
export function useDepositsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
        }
export type DepositsQueryHookResult = ReturnType<typeof useDepositsQuery>;
export type DepositsLazyQueryHookResult = ReturnType<typeof useDepositsLazyQuery>;
export type DepositsQueryResult = Apollo.QueryResult<DepositsQuery, DepositsQueryVariables>;
export const DepositEventDocument = gql`
    subscription DepositEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
    event {
      ... on Deposit {
        ...DepositFields
      }
    }
  }
}
    ${DepositFieldsFragmentDoc}`;

/**
 * __useDepositEventSubscription__
 *
 * To run a query within a React component, call `useDepositEventSubscription` and pass it any options that fit your needs.
 * When your component renders, `useDepositEventSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositEventSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useDepositEventSubscription(baseOptions: Apollo.SubscriptionHookOptions<DepositEventSubscription, DepositEventSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<DepositEventSubscription, DepositEventSubscriptionVariables>(DepositEventDocument, options);
      }
export type DepositEventSubscriptionHookResult = ReturnType<typeof useDepositEventSubscription>;
export type DepositEventSubscriptionResult = Apollo.SubscriptionResult<DepositEventSubscription>;