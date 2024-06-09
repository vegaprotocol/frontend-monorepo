import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PositionFieldsV2Fragment = { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, positionStatus: Types.PositionStatus, lossSocializationAmount: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string } } }, party: { __typename?: 'Party', id: string } };

export type PositionsV2QueryVariables = Types.Exact<{
  partyIds: Array<Types.Scalars['ID']> | Types.Scalars['ID'];
}>;


export type PositionsV2Query = { __typename?: 'Query', positions?: { __typename?: 'PositionConnection', edges?: Array<{ __typename?: 'PositionEdge', node: { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, positionStatus: Types.PositionStatus, lossSocializationAmount: string, market: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string } } }, party: { __typename?: 'Party', id: string } } }> | null } | null };

export type PositionsSubV2SubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PositionsSubV2Subscription = { __typename?: 'Subscription', positions: Array<{ __typename?: 'PositionUpdate', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, marketId: string, lossSocializationAmount: string, positionStatus: Types.PositionStatus, partyId: string }> };

export const PositionFieldsV2FragmentDoc = gql`
    fragment PositionFieldsV2 on Position {
  realisedPNL
  openVolume
  unrealisedPNL
  averageEntryPrice
  updatedAt
  positionStatus
  lossSocializationAmount
  market {
    id
    decimalPlaces
    positionDecimalPlaces
    tradableInstrument {
      instrument {
        code
      }
    }
  }
  party {
    id
  }
}
    `;
export const PositionsV2Document = gql`
    query PositionsV2($partyIds: [ID!]!) {
  positions(filter: {partyIds: $partyIds}) {
    edges {
      node {
        ...PositionFieldsV2
      }
    }
  }
}
    ${PositionFieldsV2FragmentDoc}`;

/**
 * __usePositionsV2Query__
 *
 * To run a query within a React component, call `usePositionsV2Query` and pass it any options that fit your needs.
 * When your component renders, `usePositionsV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsV2Query({
 *   variables: {
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function usePositionsV2Query(baseOptions: Apollo.QueryHookOptions<PositionsV2Query, PositionsV2QueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PositionsV2Query, PositionsV2QueryVariables>(PositionsV2Document, options);
      }
export function usePositionsV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PositionsV2Query, PositionsV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PositionsV2Query, PositionsV2QueryVariables>(PositionsV2Document, options);
        }
export type PositionsV2QueryHookResult = ReturnType<typeof usePositionsV2Query>;
export type PositionsV2LazyQueryHookResult = ReturnType<typeof usePositionsV2LazyQuery>;
export type PositionsV2QueryResult = Apollo.QueryResult<PositionsV2Query, PositionsV2QueryVariables>;
export const PositionsSubV2Document = gql`
    subscription PositionsSubV2($partyId: ID!) {
  positions(partyId: $partyId) {
    realisedPNL
    openVolume
    unrealisedPNL
    averageEntryPrice
    updatedAt
    marketId
    lossSocializationAmount
    positionStatus
    partyId
  }
}
    `;

/**
 * __usePositionsSubV2Subscription__
 *
 * To run a query within a React component, call `usePositionsSubV2Subscription` and pass it any options that fit your needs.
 * When your component renders, `usePositionsSubV2Subscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsSubV2Subscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePositionsSubV2Subscription(baseOptions: Apollo.SubscriptionHookOptions<PositionsSubV2Subscription, PositionsSubV2SubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PositionsSubV2Subscription, PositionsSubV2SubscriptionVariables>(PositionsSubV2Document, options);
      }
export type PositionsSubV2SubscriptionHookResult = ReturnType<typeof usePositionsSubV2Subscription>;
export type PositionsSubV2SubscriptionResult = Apollo.SubscriptionResult<PositionsSubV2Subscription>;