import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerStopOrderFieldsFragment = { __typename?: 'StopOrder', id: string, status: Types.StopOrderStatus, createdAt: any, ocoLinkId?: string | null, triggerDirection: Types.StopOrderTriggerDirection, trigger: { __typename?: 'StopOrderPrice', price: string } | { __typename?: 'StopOrderTrailingPercentOffset', trailingPercentOffset: string }, order?: { __typename?: 'Order', id: string } | null };

export type ExplorerStopOrderQueryVariables = Types.Exact<{
  stopOrderId: Types.Scalars['ID'];
}>;


export type ExplorerStopOrderQuery = { __typename?: 'Query', stopOrder?: { __typename?: 'StopOrder', id: string, status: Types.StopOrderStatus, createdAt: any, ocoLinkId?: string | null, triggerDirection: Types.StopOrderTriggerDirection, trigger: { __typename?: 'StopOrderPrice', price: string } | { __typename?: 'StopOrderTrailingPercentOffset', trailingPercentOffset: string }, order?: { __typename?: 'Order', id: string } | null } | null };

export const ExplorerStopOrderFieldsFragmentDoc = gql`
    fragment ExplorerStopOrderFields on StopOrder {
  id
  status
  createdAt
  trigger {
    ... on StopOrderPrice {
      price
    }
    ... on StopOrderTrailingPercentOffset {
      trailingPercentOffset
    }
  }
  createdAt
  ocoLinkId
  triggerDirection
  order {
    id
  }
}
    `;
export const ExplorerStopOrderDocument = gql`
    query ExplorerStopOrder($stopOrderId: ID!) {
  stopOrder(id: $stopOrderId) {
    ...ExplorerStopOrderFields
  }
}
    ${ExplorerStopOrderFieldsFragmentDoc}`;

/**
 * __useExplorerStopOrderQuery__
 *
 * To run a query within a React component, call `useExplorerStopOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerStopOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerStopOrderQuery({
 *   variables: {
 *      stopOrderId: // value for 'stopOrderId'
 *   },
 * });
 */
export function useExplorerStopOrderQuery(baseOptions: Apollo.QueryHookOptions<ExplorerStopOrderQuery, ExplorerStopOrderQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerStopOrderQuery, ExplorerStopOrderQueryVariables>(ExplorerStopOrderDocument, options);
      }
export function useExplorerStopOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerStopOrderQuery, ExplorerStopOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerStopOrderQuery, ExplorerStopOrderQueryVariables>(ExplorerStopOrderDocument, options);
        }
export type ExplorerStopOrderQueryHookResult = ReturnType<typeof useExplorerStopOrderQuery>;
export type ExplorerStopOrderLazyQueryHookResult = ReturnType<typeof useExplorerStopOrderLazyQuery>;
export type ExplorerStopOrderQueryResult = Apollo.QueryResult<ExplorerStopOrderQuery, ExplorerStopOrderQueryVariables>;