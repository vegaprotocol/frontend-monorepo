import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SuccessorMarketIdQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type SuccessorMarketIdQuery = { __typename?: 'Query', market?: { __typename?: 'Market', successorMarketID?: string | null } | null };

export type ParentMarketIdQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type ParentMarketIdQuery = { __typename?: 'Query', market?: { __typename?: 'Market', parentMarketID?: string | null } | null };

export type SuccessorMarketIdsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SuccessorMarketIdsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, successorMarketID?: string | null, parentMarketID?: string | null } }> } | null };

export type SuccessorMarketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type SuccessorMarketQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, state: Types.MarketState, tradingMode: Types.MarketTradingMode, positionDecimalPlaces: number, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', name: string, code: string } } } | null };


export const SuccessorMarketIdDocument = gql`
    query SuccessorMarketId($marketId: ID!) {
  market(id: $marketId) {
    successorMarketID
  }
}
    `;

/**
 * __useSuccessorMarketIdQuery__
 *
 * To run a query within a React component, call `useSuccessorMarketIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuccessorMarketIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuccessorMarketIdQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useSuccessorMarketIdQuery(baseOptions: Apollo.QueryHookOptions<SuccessorMarketIdQuery, SuccessorMarketIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuccessorMarketIdQuery, SuccessorMarketIdQueryVariables>(SuccessorMarketIdDocument, options);
      }
export function useSuccessorMarketIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuccessorMarketIdQuery, SuccessorMarketIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuccessorMarketIdQuery, SuccessorMarketIdQueryVariables>(SuccessorMarketIdDocument, options);
        }
export type SuccessorMarketIdQueryHookResult = ReturnType<typeof useSuccessorMarketIdQuery>;
export type SuccessorMarketIdLazyQueryHookResult = ReturnType<typeof useSuccessorMarketIdLazyQuery>;
export type SuccessorMarketIdQueryResult = Apollo.QueryResult<SuccessorMarketIdQuery, SuccessorMarketIdQueryVariables>;
export const ParentMarketIdDocument = gql`
    query ParentMarketId($marketId: ID!) {
  market(id: $marketId) {
    parentMarketID
  }
}
    `;

/**
 * __useParentMarketIdQuery__
 *
 * To run a query within a React component, call `useParentMarketIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useParentMarketIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useParentMarketIdQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useParentMarketIdQuery(baseOptions: Apollo.QueryHookOptions<ParentMarketIdQuery, ParentMarketIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ParentMarketIdQuery, ParentMarketIdQueryVariables>(ParentMarketIdDocument, options);
      }
export function useParentMarketIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ParentMarketIdQuery, ParentMarketIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ParentMarketIdQuery, ParentMarketIdQueryVariables>(ParentMarketIdDocument, options);
        }
export type ParentMarketIdQueryHookResult = ReturnType<typeof useParentMarketIdQuery>;
export type ParentMarketIdLazyQueryHookResult = ReturnType<typeof useParentMarketIdLazyQuery>;
export type ParentMarketIdQueryResult = Apollo.QueryResult<ParentMarketIdQuery, ParentMarketIdQueryVariables>;
export const SuccessorMarketIdsDocument = gql`
    query SuccessorMarketIds {
  marketsConnection {
    edges {
      node {
        id
        successorMarketID
        parentMarketID
      }
    }
  }
}
    `;

/**
 * __useSuccessorMarketIdsQuery__
 *
 * To run a query within a React component, call `useSuccessorMarketIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuccessorMarketIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuccessorMarketIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSuccessorMarketIdsQuery(baseOptions?: Apollo.QueryHookOptions<SuccessorMarketIdsQuery, SuccessorMarketIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuccessorMarketIdsQuery, SuccessorMarketIdsQueryVariables>(SuccessorMarketIdsDocument, options);
      }
export function useSuccessorMarketIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuccessorMarketIdsQuery, SuccessorMarketIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuccessorMarketIdsQuery, SuccessorMarketIdsQueryVariables>(SuccessorMarketIdsDocument, options);
        }
export type SuccessorMarketIdsQueryHookResult = ReturnType<typeof useSuccessorMarketIdsQuery>;
export type SuccessorMarketIdsLazyQueryHookResult = ReturnType<typeof useSuccessorMarketIdsLazyQuery>;
export type SuccessorMarketIdsQueryResult = Apollo.QueryResult<SuccessorMarketIdsQuery, SuccessorMarketIdsQueryVariables>;
export const SuccessorMarketDocument = gql`
    query SuccessorMarket($marketId: ID!) {
  market(id: $marketId) {
    id
    state
    tradingMode
    positionDecimalPlaces
    tradableInstrument {
      instrument {
        name
        code
      }
    }
  }
}
    `;

/**
 * __useSuccessorMarketQuery__
 *
 * To run a query within a React component, call `useSuccessorMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuccessorMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuccessorMarketQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useSuccessorMarketQuery(baseOptions: Apollo.QueryHookOptions<SuccessorMarketQuery, SuccessorMarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SuccessorMarketQuery, SuccessorMarketQueryVariables>(SuccessorMarketDocument, options);
      }
export function useSuccessorMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SuccessorMarketQuery, SuccessorMarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SuccessorMarketQuery, SuccessorMarketQueryVariables>(SuccessorMarketDocument, options);
        }
export type SuccessorMarketQueryHookResult = ReturnType<typeof useSuccessorMarketQuery>;
export type SuccessorMarketLazyQueryHookResult = ReturnType<typeof useSuccessorMarketLazyQuery>;
export type SuccessorMarketQueryResult = Apollo.QueryResult<SuccessorMarketQuery, SuccessorMarketQueryVariables>;
