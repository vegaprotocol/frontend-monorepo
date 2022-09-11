import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DepositEventSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type DepositEventSubscription = { __typename?: 'Subscription', busEvents?: Array<{ __typename?: 'BusEvent', event: { __typename?: 'Account' } | { __typename?: 'Asset' } | { __typename?: 'AuctionEvent' } | { __typename?: 'Deposit', id: string, txHash?: string | null, status: Types.DepositStatus } | { __typename?: 'LiquidityProvision' } | { __typename?: 'LossSocialization' } | { __typename?: 'MarginLevels' } | { __typename?: 'Market' } | { __typename?: 'MarketData' } | { __typename?: 'MarketEvent' } | { __typename?: 'MarketTick' } | { __typename?: 'NodeSignature' } | { __typename?: 'OracleSpec' } | { __typename?: 'Order' } | { __typename?: 'Party' } | { __typename?: 'PositionResolution' } | { __typename?: 'Proposal' } | { __typename?: 'RiskFactor' } | { __typename?: 'SettleDistressed' } | { __typename?: 'SettlePosition' } | { __typename?: 'TimeUpdate' } | { __typename?: 'Trade' } | { __typename?: 'TransferResponses' } | { __typename?: 'Vote' } | { __typename?: 'Withdrawal' } }> | null };


export const DepositEventDocument = gql`
    subscription DepositEvent($partyId: ID!) {
  busEvents(partyId: $partyId, batchSize: 0, types: [Deposit]) {
    event {
      ... on Deposit {
        id
        txHash
        status
      }
    }
  }
}
    `;

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