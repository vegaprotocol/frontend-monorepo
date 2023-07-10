import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EstimateFeesQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  partyId: Types.Scalars['ID'];
  price?: Types.InputMaybe<Types.Scalars['String']>;
  size: Types.Scalars['String'];
  side: Types.Side;
  timeInForce: Types.OrderTimeInForce;
  expiration?: Types.InputMaybe<Types.Scalars['Timestamp']>;
  type: Types.OrderType;
}>;


export type EstimateFeesQuery = { __typename: 'Query', estimateFees: { __typename: 'FeeEstimate', totalFeeAmount: string, fees: { __typename: 'TradeFee', makerFee: string, infrastructureFee: string, liquidityFee: string } } };


export const EstimateFeesDocument = gql`
    query EstimateFees($marketId: ID!, $partyId: ID!, $price: String, $size: String!, $side: Side!, $timeInForce: OrderTimeInForce!, $expiration: Timestamp, $type: OrderType!) {
  estimateFees(
    marketId: $marketId
    partyId: $partyId
    price: $price
    size: $size
    side: $side
    timeInForce: $timeInForce
    expiration: $expiration
    type: $type
  ) {
    fees {
      makerFee
      infrastructureFee
      liquidityFee
    }
    totalFeeAmount
  }
}
    `;

/**
 * __useEstimateFeesQuery__
 *
 * To run a query within a React component, call `useEstimateFeesQuery` and pass it any options that fit your needs.
 * When your component renders, `useEstimateFeesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEstimateFeesQuery({
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
export function useEstimateFeesQuery(baseOptions: Apollo.QueryHookOptions<EstimateFeesQuery, EstimateFeesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EstimateFeesQuery, EstimateFeesQueryVariables>(EstimateFeesDocument, options);
      }
export function useEstimateFeesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EstimateFeesQuery, EstimateFeesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EstimateFeesQuery, EstimateFeesQueryVariables>(EstimateFeesDocument, options);
        }
export type EstimateFeesQueryHookResult = ReturnType<typeof useEstimateFeesQuery>;
export type EstimateFeesLazyQueryHookResult = ReturnType<typeof useEstimateFeesLazyQuery>;
export type EstimateFeesQueryResult = Apollo.QueryResult<EstimateFeesQuery, EstimateFeesQueryVariables>;