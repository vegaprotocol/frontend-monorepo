import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PositionFieldsFragment = { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, positionStatus: Types.PositionStatus, lossSocializationAmount: string, market: { __typename?: 'Market', id: string }, party: { __typename?: 'Party', id: string } };

export type PositionsQueryVariables = Types.Exact<{
  partyIds: Array<Types.Scalars['ID']> | Types.Scalars['ID'];
}>;


export type PositionsQuery = { __typename?: 'Query', positions?: { __typename?: 'PositionConnection', edges?: Array<{ __typename?: 'PositionEdge', node: { __typename?: 'Position', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, positionStatus: Types.PositionStatus, lossSocializationAmount: string, market: { __typename?: 'Market', id: string }, party: { __typename?: 'Party', id: string } } }> | null } | null };

export type PositionsSubscriptionSubscriptionVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PositionsSubscriptionSubscription = { __typename?: 'Subscription', positions: Array<{ __typename?: 'PositionUpdate', realisedPNL: string, openVolume: string, unrealisedPNL: string, averageEntryPrice: string, updatedAt?: any | null, marketId: string, lossSocializationAmount: string, positionStatus: Types.PositionStatus, partyId: string }> };

export type EstimatePositionQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  openVolume: Types.Scalars['String'];
  averageEntryPrice: Types.Scalars['String'];
  orders?: Types.InputMaybe<Array<Types.OrderInfo> | Types.OrderInfo>;
  marginAccountBalance: Types.Scalars['String'];
  generalAccountBalance: Types.Scalars['String'];
  orderMarginAccountBalance: Types.Scalars['String'];
  marginMode: Types.MarginMode;
  marginFactor?: Types.InputMaybe<Types.Scalars['String']>;
  includeRequiredPositionMarginInAvailableCollateral?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;


export type EstimatePositionQuery = { __typename?: 'Query', estimatePosition?: { __typename?: 'PositionEstimate', collateralIncreaseEstimate: { __typename?: 'CollateralIncreaseEstimate', worstCase: string, bestCase: string }, liquidation?: { __typename?: 'LiquidationEstimate', worstCase: { __typename?: 'LiquidationPrice', open_volume_only: string, including_buy_orders: string, including_sell_orders: string }, bestCase: { __typename?: 'LiquidationPrice', open_volume_only: string, including_buy_orders: string, including_sell_orders: string } } | null } | null };

export const PositionFieldsFragmentDoc = gql`
    fragment PositionFields on Position {
  realisedPNL
  openVolume
  unrealisedPNL
  averageEntryPrice
  updatedAt
  positionStatus
  lossSocializationAmount
  market {
    id
  }
  party {
    id
  }
}
    `;
export const PositionsDocument = gql`
    query Positions($partyIds: [ID!]!) {
  positions(filter: {partyIds: $partyIds}) {
    edges {
      node {
        ...PositionFields
      }
    }
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __usePositionsQuery__
 *
 * To run a query within a React component, call `usePositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsQuery({
 *   variables: {
 *      partyIds: // value for 'partyIds'
 *   },
 * });
 */
export function usePositionsQuery(baseOptions: Apollo.QueryHookOptions<PositionsQuery, PositionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PositionsQuery, PositionsQueryVariables>(PositionsDocument, options);
      }
export function usePositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PositionsQuery, PositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PositionsQuery, PositionsQueryVariables>(PositionsDocument, options);
        }
export type PositionsQueryHookResult = ReturnType<typeof usePositionsQuery>;
export type PositionsLazyQueryHookResult = ReturnType<typeof usePositionsLazyQuery>;
export type PositionsQueryResult = Apollo.QueryResult<PositionsQuery, PositionsQueryVariables>;
export const PositionsSubscriptionDocument = gql`
    subscription PositionsSubscription($partyId: ID!) {
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
 * __usePositionsSubscriptionSubscription__
 *
 * To run a query within a React component, call `usePositionsSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePositionsSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePositionsSubscriptionSubscription({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePositionsSubscriptionSubscription(baseOptions: Apollo.SubscriptionHookOptions<PositionsSubscriptionSubscription, PositionsSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PositionsSubscriptionSubscription, PositionsSubscriptionSubscriptionVariables>(PositionsSubscriptionDocument, options);
      }
export type PositionsSubscriptionSubscriptionHookResult = ReturnType<typeof usePositionsSubscriptionSubscription>;
export type PositionsSubscriptionSubscriptionResult = Apollo.SubscriptionResult<PositionsSubscriptionSubscription>;
export const EstimatePositionDocument = gql`
    query EstimatePosition($marketId: ID!, $openVolume: String!, $averageEntryPrice: String!, $orders: [OrderInfo!], $marginAccountBalance: String!, $generalAccountBalance: String!, $orderMarginAccountBalance: String!, $marginMode: MarginMode!, $marginFactor: String, $includeRequiredPositionMarginInAvailableCollateral: Boolean) {
  estimatePosition(
    marketId: $marketId
    openVolume: $openVolume
    averageEntryPrice: $averageEntryPrice
    orders: $orders
    marginAccountBalance: $marginAccountBalance
    generalAccountBalance: $generalAccountBalance
    orderMarginAccountBalance: $orderMarginAccountBalance
    marginMode: $marginMode
    marginFactor: $marginFactor
    includeRequiredPositionMarginInAvailableCollateral: $includeRequiredPositionMarginInAvailableCollateral
    scaleLiquidationPriceToMarketDecimals: true
  ) {
    collateralIncreaseEstimate {
      worstCase
      bestCase
    }
    liquidation {
      worstCase {
        open_volume_only
        including_buy_orders
        including_sell_orders
      }
      bestCase {
        open_volume_only
        including_buy_orders
        including_sell_orders
      }
    }
  }
}
    `;

/**
 * __useEstimatePositionQuery__
 *
 * To run a query within a React component, call `useEstimatePositionQuery` and pass it any options that fit your needs.
 * When your component renders, `useEstimatePositionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEstimatePositionQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      openVolume: // value for 'openVolume'
 *      averageEntryPrice: // value for 'averageEntryPrice'
 *      orders: // value for 'orders'
 *      marginAccountBalance: // value for 'marginAccountBalance'
 *      generalAccountBalance: // value for 'generalAccountBalance'
 *      orderMarginAccountBalance: // value for 'orderMarginAccountBalance'
 *      marginMode: // value for 'marginMode'
 *      marginFactor: // value for 'marginFactor'
 *      includeRequiredPositionMarginInAvailableCollateral: // value for 'includeRequiredPositionMarginInAvailableCollateral'
 *   },
 * });
 */
export function useEstimatePositionQuery(baseOptions: Apollo.QueryHookOptions<EstimatePositionQuery, EstimatePositionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EstimatePositionQuery, EstimatePositionQueryVariables>(EstimatePositionDocument, options);
      }
export function useEstimatePositionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EstimatePositionQuery, EstimatePositionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EstimatePositionQuery, EstimatePositionQueryVariables>(EstimatePositionDocument, options);
        }
export type EstimatePositionQueryHookResult = ReturnType<typeof useEstimatePositionQuery>;
export type EstimatePositionLazyQueryHookResult = ReturnType<typeof useEstimatePositionLazyQuery>;
export type EstimatePositionQueryResult = Apollo.QueryResult<EstimatePositionQuery, EstimatePositionQueryVariables>;