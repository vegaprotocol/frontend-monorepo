import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SingleMarketFieldsFragment = { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null } };

export type MarketQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, state: Types.MarketState, tradingMode: Types.MarketTradingMode, fees: { __typename?: 'Fees', factors: { __typename?: 'FeeFactors', makerFee: string, infrastructureFee: string, liquidityFee: string } }, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', id: string, name: string, code: string, metadata: { __typename?: 'InstrumentMetadata', tags?: Array<string> | null }, product: { __typename?: 'Future', quoteName: string, dataSourceSpecForTradingTermination: { __typename?: 'DataSourceSpec', id: string }, settlementAsset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } } } }, marketTimestamps: { __typename?: 'MarketTimestamps', open?: string | null, close?: string | null } } | null };

export const SingleMarketFieldsFragmentDoc = gql`
    fragment SingleMarketFields on Market {
  id
  decimalPlaces
  positionDecimalPlaces
  state
  tradingMode
  fees {
    factors {
      makerFee
      infrastructureFee
      liquidityFee
    }
  }
  tradableInstrument {
    instrument {
      id
      name
      code
      metadata {
        tags
      }
      product {
        ... on Future {
          dataSourceSpecForTradingTermination {
            id
          }
          settlementAsset {
            id
            symbol
            name
            decimals
          }
          quoteName
        }
      }
    }
  }
  marketTimestamps {
    open
    close
  }
}
    `;
export const MarketDocument = gql`
    query Market($marketId: ID!) {
  market(id: $marketId) {
    ...SingleMarketFields
  }
}
    ${SingleMarketFieldsFragmentDoc}`;

/**
 * __useMarketQuery__
 *
 * To run a query within a React component, call `useMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketQuery(baseOptions: Apollo.QueryHookOptions<MarketQuery, MarketQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketQuery, MarketQueryVariables>(MarketDocument, options);
      }
export function useMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketQuery, MarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketQuery, MarketQueryVariables>(MarketDocument, options);
        }
export type MarketQueryHookResult = ReturnType<typeof useMarketQuery>;
export type MarketLazyQueryHookResult = ReturnType<typeof useMarketLazyQuery>;
export type MarketQueryResult = Apollo.QueryResult<MarketQuery, MarketQueryVariables>;