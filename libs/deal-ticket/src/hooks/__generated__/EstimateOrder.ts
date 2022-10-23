import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EstimateOrderQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  partyId: Types.Scalars['ID'];
  price?: Types.InputMaybe<Types.Scalars['String']>;
  size: Types.Scalars['String'];
  side: Types.Side;
  timeInForce: Types.OrderTimeInForce;
  expiration?: Types.InputMaybe<Types.Scalars['String']>;
  type: Types.OrderType;
}>;


export type EstimateOrderQuery = { __typename?: 'Query', estimateOrder: { __typename?: 'OrderEstimate', totalFeeAmount: string, fee: { __typename?: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string }, marginLevels: { __typename?: 'MarginLevels', initialLevel: string } } };


export const EstimateOrderDocument = gql`
    query EstimateOrder($marketId: ID!, $partyId: ID!, $price: String, $size: String!, $side: Side!, $timeInForce: OrderTimeInForce!, $expiration: String, $type: OrderType!) {
  estimateOrder(
    marketId: $marketId
    partyId: $partyId
    price: $price
    size: $size
    side: $side
    timeInForce: $timeInForce
    expiration: $expiration
    type: $type
  ) {
    fee {
      makerFee
      infrastructureFee
      liquidityFee
    }
    marginLevels {
      initialLevel
    }
    totalFeeAmount
  }
}
    `;

/**
 * __useEstimateOrderQuery__
 *
 * To run a query within a React component, call `useEstimateOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useEstimateOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEstimateOrderQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      partyId: // value for 'partyId'
 *      price: // value for 'price'
 *      size: // value for 'size'
 *      side: // value for 'side'
 *      timeInForce: // value for 'timeInForce'
 *      expiration: // value for 'expiration'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useEstimateOrderQuery(baseOptions: Apollo.QueryHookOptions<EstimateOrderQuery, EstimateOrderQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EstimateOrderQuery, EstimateOrderQueryVariables>(EstimateOrderDocument, options);
      }
export function useEstimateOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EstimateOrderQuery, EstimateOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EstimateOrderQuery, EstimateOrderQueryVariables>(EstimateOrderDocument, options);
        }
export type EstimateOrderQueryHookResult = ReturnType<typeof useEstimateOrderQuery>;
export type EstimateOrderLazyQueryHookResult = ReturnType<typeof useEstimateOrderLazyQuery>;
export type EstimateOrderQueryResult = Apollo.QueryResult<EstimateOrderQuery, EstimateOrderQueryVariables>;