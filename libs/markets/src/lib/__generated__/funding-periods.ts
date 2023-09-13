import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FundingPeriodsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  dateRange?: Types.InputMaybe<Types.DateRange>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type FundingPeriodsQuery = { __typename?: 'Query', fundingPeriods: { __typename?: 'FundingPeriodConnection', edges: Array<{ __typename?: 'FundingPeriodEdge', node: { __typename?: 'FundingPeriod', marketId: string, seq: number, startTime: any, endTime?: any | null, fundingPayment?: string | null, fundingRate?: string | null, externalTwap?: string | null, internalTwap?: string | null } }> } };

export type FundingPeriodDataPointsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
  dateRange?: Types.InputMaybe<Types.DateRange>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;


export type FundingPeriodDataPointsQuery = { __typename?: 'Query', fundingPeriodDataPoints: { __typename?: 'FundingPeriodDataPointConnection', edges: Array<{ __typename?: 'FundingPeriodDataPointEdge', node: { __typename?: 'FundingPeriodDataPoint', marketId: string, seq: number, dataPointSource?: Types.FundingPeriodDataPointSource | null, price: string, twap?: string | null, timestamp: any } }> } };


export const FundingPeriodsDocument = gql`
    query FundingPeriods($marketId: ID!, $dateRange: DateRange, $pagination: Pagination) {
  fundingPeriods(
    marketId: $marketId
    dateRange: $dateRange
    pagination: $pagination
  ) {
    edges {
      node {
        marketId
        seq
        startTime
        endTime
        fundingPayment
        fundingRate
        externalTwap
        internalTwap
      }
    }
  }
}
    `;

/**
 * __useFundingPeriodsQuery__
 *
 * To run a query within a React component, call `useFundingPeriodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFundingPeriodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFundingPeriodsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      dateRange: // value for 'dateRange'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useFundingPeriodsQuery(baseOptions: Apollo.QueryHookOptions<FundingPeriodsQuery, FundingPeriodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FundingPeriodsQuery, FundingPeriodsQueryVariables>(FundingPeriodsDocument, options);
      }
export function useFundingPeriodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FundingPeriodsQuery, FundingPeriodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FundingPeriodsQuery, FundingPeriodsQueryVariables>(FundingPeriodsDocument, options);
        }
export type FundingPeriodsQueryHookResult = ReturnType<typeof useFundingPeriodsQuery>;
export type FundingPeriodsLazyQueryHookResult = ReturnType<typeof useFundingPeriodsLazyQuery>;
export type FundingPeriodsQueryResult = Apollo.QueryResult<FundingPeriodsQuery, FundingPeriodsQueryVariables>;
export const FundingPeriodDataPointsDocument = gql`
    query FundingPeriodDataPoints($marketId: ID!, $dateRange: DateRange, $pagination: Pagination) {
  fundingPeriodDataPoints(
    marketId: $marketId
    dateRange: $dateRange
    pagination: $pagination
  ) {
    edges {
      node {
        marketId
        seq
        dataPointSource
        price
        twap
        timestamp
      }
    }
  }
}
    `;

/**
 * __useFundingPeriodDataPointsQuery__
 *
 * To run a query within a React component, call `useFundingPeriodDataPointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFundingPeriodDataPointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFundingPeriodDataPointsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *      dateRange: // value for 'dateRange'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useFundingPeriodDataPointsQuery(baseOptions: Apollo.QueryHookOptions<FundingPeriodDataPointsQuery, FundingPeriodDataPointsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FundingPeriodDataPointsQuery, FundingPeriodDataPointsQueryVariables>(FundingPeriodDataPointsDocument, options);
      }
export function useFundingPeriodDataPointsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FundingPeriodDataPointsQuery, FundingPeriodDataPointsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FundingPeriodDataPointsQuery, FundingPeriodDataPointsQueryVariables>(FundingPeriodDataPointsDocument, options);
        }
export type FundingPeriodDataPointsQueryHookResult = ReturnType<typeof useFundingPeriodDataPointsQuery>;
export type FundingPeriodDataPointsLazyQueryHookResult = ReturnType<typeof useFundingPeriodDataPointsLazyQuery>;
export type FundingPeriodDataPointsQueryResult = Apollo.QueryResult<FundingPeriodDataPointsQuery, FundingPeriodDataPointsQueryVariables>;