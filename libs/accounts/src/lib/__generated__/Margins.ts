import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarginFieldsFragment = { __typename?: 'MarginLevels', maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, marginFactor: string, marginMode: Types.MarginMode, orderMarginLevel: string, asset: { __typename?: 'Asset', id: string }, market: { __typename?: 'Market', id: string } };

export type MarginsQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type MarginsQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, marginsConnection?: { __typename?: 'MarginConnection', edges?: Array<{ __typename?: 'MarginEdge', node: { __typename?: 'MarginLevels', maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, marginFactor: string, marginMode: Types.MarginMode, orderMarginLevel: string, asset: { __typename?: 'Asset', id: string }, market: { __typename?: 'Market', id: string } } }> | null } | null } | null };

export type MarginsSubscriptionSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type MarginsSubscriptionSubscription = { __typename?: 'Subscription', margins: { __typename?: 'MarginLevelsUpdate', marketId: string, asset: string, partyId: string, maintenanceLevel: string, searchLevel: string, initialLevel: string, collateralReleaseLevel: string, marginFactor: string, marginMode: Types.MarginMode, orderMarginLevel: string, timestamp: any } };

export const MarginFieldsFragmentDoc = gql`
    fragment MarginFields on MarginLevels {
  maintenanceLevel
  searchLevel
  initialLevel
  collateralReleaseLevel
  marginFactor
  marginMode
  orderMarginLevel
  asset {
    id
  }
  market {
    id
  }
}
    `;
export const MarginsDocument = gql`
    query Margins($partyId: ID!) {
  party(id: $partyId) {
    id
    marginsConnection {
      edges {
        node {
          ...MarginFields
        }
      }
    }
  }
}
    ${MarginFieldsFragmentDoc}`;

/**
 * __useMarginsQuery__
 *
 * To run a query within a React component, call `useMarginsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarginsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarginsQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useMarginsQuery(baseOptions: Apollo.QueryHookOptions<MarginsQuery, MarginsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarginsQuery, MarginsQueryVariables>(MarginsDocument, options);
      }
export function useMarginsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarginsQuery, MarginsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarginsQuery, MarginsQueryVariables>(MarginsDocument, options);
        }
export type MarginsQueryHookResult = ReturnType<typeof useMarginsQuery>;
export type MarginsLazyQueryHookResult = ReturnType<typeof useMarginsLazyQuery>;
export type MarginsQueryResult = Apollo.QueryResult<MarginsQuery, MarginsQueryVariables>;
export const MarginsSubscriptionDocument = gql`
    subscription MarginsSubscription($partyId: ID!) {
  margins(partyId: $partyId) {
    marketId
    asset
    partyId
    maintenanceLevel
    searchLevel
    initialLevel
    collateralReleaseLevel
    marginFactor
    marginMode
    orderMarginLevel
    timestamp
  }
}
    `;

/**
 * __useMarginsSubscriptionSubscription__
 *
 * To run a query within a React component, call `useMarginsSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useMarginsSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarginsSubscriptionSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function useMarginsSubscriptionSubscription(baseOptions: Apollo.SubscriptionHookOptions<MarginsSubscriptionSubscription, MarginsSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<MarginsSubscriptionSubscription, MarginsSubscriptionSubscriptionVariables>(MarginsSubscriptionDocument, options);
      }
export type MarginsSubscriptionSubscriptionHookResult = ReturnType<typeof useMarginsSubscriptionSubscription>;
export type MarginsSubscriptionSubscriptionResult = Apollo.SubscriptionResult<MarginsSubscriptionSubscription>;