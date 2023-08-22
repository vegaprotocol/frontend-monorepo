import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerOracleForMarketsMarketFragment = { __typename?: 'Market', id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string } } | { __typename?: 'Spot' } } } };

export type ExplorerOracleFormMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ExplorerOracleFormMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', product: { __typename?: 'Future', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string } } | { __typename?: 'Perpetual', dataSourceSpecForSettlementData: { __typename?: 'DataSourceSpec', id: string }, dataSourceSpecForSettlementSchedule: { __typename?: 'DataSourceSpec', id: string } } | { __typename?: 'Spot' } } } } }> } | null };

export const ExplorerOracleForMarketsMarketFragmentDoc = gql`
    fragment ExplorerOracleForMarketsMarket on Market {
  id
  tradableInstrument {
    instrument {
      product {
        ... on Future {
          dataSourceSpecForSettlementData {
            id
          }
          dataSourceSpecForTradingTermination {
            id
          }
        }
        ... on Perpetual {
          dataSourceSpecForSettlementData {
            id
          }
          dataSourceSpecForSettlementSchedule {
            id
          }
        }
      }
    }
  }
}
    `;
export const ExplorerOracleFormMarketsDocument = gql`
    query ExplorerOracleFormMarkets {
  marketsConnection {
    edges {
      node {
        ...ExplorerOracleForMarketsMarket
      }
    }
  }
}
    ${ExplorerOracleForMarketsMarketFragmentDoc}`;

/**
 * __useExplorerOracleFormMarketsQuery__
 *
 * To run a query within a React component, call `useExplorerOracleFormMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerOracleFormMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerOracleFormMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useExplorerOracleFormMarketsQuery(baseOptions?: Apollo.QueryHookOptions<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>(ExplorerOracleFormMarketsDocument, options);
      }
export function useExplorerOracleFormMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>(ExplorerOracleFormMarketsDocument, options);
        }
export type ExplorerOracleFormMarketsQueryHookResult = ReturnType<typeof useExplorerOracleFormMarketsQuery>;
export type ExplorerOracleFormMarketsLazyQueryHookResult = ReturnType<typeof useExplorerOracleFormMarketsLazyQuery>;
export type ExplorerOracleFormMarketsQueryResult = Apollo.QueryResult<ExplorerOracleFormMarketsQuery, ExplorerOracleFormMarketsQueryVariables>;