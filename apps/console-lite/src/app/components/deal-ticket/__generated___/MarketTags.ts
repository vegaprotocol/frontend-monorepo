import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketTagsQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketTagsQuery = { __typename?: 'Query', market?: { __typename?: 'Market', tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null } } } } | null };


export const MarketTagsDocument = gql`
    query MarketTags($marketId: ID!) {
  market(id: $marketId) {
    tradableInstrument {
      instrument {
        metadata {
          tags
        }
      }
    }
  }
}
    `;

/**
 * __useMarketTagsQuery__
 *
 * To run a query within a React component, call `useMarketTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketTagsQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketTagsQuery(baseOptions: Apollo.QueryHookOptions<MarketTagsQuery, MarketTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketTagsQuery, MarketTagsQueryVariables>(MarketTagsDocument, options);
      }
export function useMarketTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketTagsQuery, MarketTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketTagsQuery, MarketTagsQueryVariables>(MarketTagsDocument, options);
        }
export type MarketTagsQueryHookResult = ReturnType<typeof useMarketTagsQuery>;
export type MarketTagsLazyQueryHookResult = ReturnType<typeof useMarketTagsLazyQuery>;
export type MarketTagsQueryResult = Apollo.QueryResult<MarketTagsQuery, MarketTagsQueryVariables>;