import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketsDataFieldsFragment = { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, openInterest: string, market: { __typename?: 'Market', id: string } };

export type MarketsDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MarketsDataQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', data?: { __typename?: 'MarketData', bestBidPrice: string, bestOfferPrice: string, markPrice: string, trigger: Types.AuctionTrigger, staticMidPrice: string, marketState: Types.MarketState, marketTradingMode: Types.MarketTradingMode, indicativeVolume: string, indicativePrice: string, bestStaticBidPrice: string, bestStaticOfferPrice: string, targetStake?: string | null, suppliedStake?: string | null, auctionStart?: string | null, auctionEnd?: string | null, openInterest: string, market: { __typename?: 'Market', id: string } } | null } }> } | null };

export const MarketsDataFieldsFragmentDoc = gql`
    fragment MarketsDataFields on MarketData {
  market {
    id
  }
  bestBidPrice
  bestOfferPrice
  markPrice
  trigger
  staticMidPrice
  marketState
  marketTradingMode
  indicativeVolume
  indicativePrice
  bestStaticBidPrice
  bestStaticOfferPrice
  targetStake
  suppliedStake
  auctionStart
  auctionEnd
  openInterest
}
    `;
export const MarketsDataDocument = gql`
    query MarketsData {
  marketsConnection {
    edges {
      node {
        data {
          ...MarketsDataFields
        }
      }
    }
  }
}
    ${MarketsDataFieldsFragmentDoc}`;

/**
 * __useMarketsDataQuery__
 *
 * To run a query within a React component, call `useMarketsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketsDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketsDataQuery(baseOptions?: Apollo.QueryHookOptions<MarketsDataQuery, MarketsDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketsDataQuery, MarketsDataQueryVariables>(MarketsDataDocument, options);
      }
export function useMarketsDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketsDataQuery, MarketsDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketsDataQuery, MarketsDataQueryVariables>(MarketsDataDocument, options);
        }
export type MarketsDataQueryHookResult = ReturnType<typeof useMarketsDataQuery>;
export type MarketsDataLazyQueryHookResult = ReturnType<typeof useMarketsDataLazyQuery>;
export type MarketsDataQueryResult = Apollo.QueryResult<MarketsDataQuery, MarketsDataQueryVariables>;