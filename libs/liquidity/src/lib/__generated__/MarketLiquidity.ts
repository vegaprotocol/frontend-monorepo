import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FeeShareFieldsFragment = { __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, party: { __typename?: 'Party', id: string } };

export type MarketLiquidityQueryVariables = Types.Exact<{
  marketId: Types.Scalars['ID'];
}>;


export type MarketLiquidityQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, decimalPlaces: number, positionDecimalPlaces: number, liquidityProvisionsConnection?: { __typename?: 'LiquidityProvisionsConnection', edges?: Array<{ __typename?: 'LiquidityProvisionsEdge', node: { __typename?: 'LiquidityProvision', id?: string | null, createdAt: string, updatedAt?: string | null, commitmentAmount: string, fee: string, status: Types.LiquidityProvisionStatus, party: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'Account', type: Types.AccountType, balance: string } } | null> | null } | null } } } | null> | null } | null, tradableInstrument: { __typename?: 'TradableInstrument', instrument: { __typename?: 'Instrument', code: string, name: string, product: { __typename?: 'Future', settlementAsset: { __typename?: 'Asset', id: string, symbol: string, decimals: number } } } }, data?: { __typename?: 'MarketData', suppliedStake?: string | null, openInterest: string, targetStake?: string | null, marketValueProxy: string, market: { __typename?: 'Market', id: string }, liquidityProviderFeeShare?: Array<{ __typename?: 'LiquidityProviderFeeShare', equityLikeShare: string, averageEntryValuation: string, party: { __typename?: 'Party', id: string } }> | null } | null } | null };

export const FeeShareFieldsFragmentDoc = gql`
    fragment FeeShareFields on LiquidityProviderFeeShare {
  party {
    id
  }
  equityLikeShare
  averageEntryValuation
}
    `;
export const MarketLiquidityDocument = gql`
    query MarketLiquidity($marketId: ID!) {
  market(id: $marketId) {
    id
    decimalPlaces
    positionDecimalPlaces
    liquidityProvisionsConnection {
      edges {
        node {
          id
          party {
            id
            accountsConnection(marketId: $marketId, type: ACCOUNT_TYPE_BOND) {
              edges {
                node {
                  type
                  balance
                }
              }
            }
          }
          createdAt
          updatedAt
          commitmentAmount
          fee
          status
        }
      }
    }
    tradableInstrument {
      instrument {
        code
        name
        product {
          ... on Future {
            settlementAsset {
              id
              symbol
              decimals
            }
          }
        }
      }
    }
    data {
      market {
        id
      }
      suppliedStake
      openInterest
      targetStake
      marketValueProxy
      liquidityProviderFeeShare {
        ...FeeShareFields
      }
    }
  }
}
    ${FeeShareFieldsFragmentDoc}`;

/**
 * __useMarketLiquidityQuery__
 *
 * To run a query within a React component, call `useMarketLiquidityQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketLiquidityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketLiquidityQuery({
 *   variables: {
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useMarketLiquidityQuery(baseOptions: Apollo.QueryHookOptions<MarketLiquidityQuery, MarketLiquidityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MarketLiquidityQuery, MarketLiquidityQueryVariables>(MarketLiquidityDocument, options);
      }
export function useMarketLiquidityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketLiquidityQuery, MarketLiquidityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MarketLiquidityQuery, MarketLiquidityQueryVariables>(MarketLiquidityDocument, options);
        }
export type MarketLiquidityQueryHookResult = ReturnType<typeof useMarketLiquidityQuery>;
export type MarketLiquidityLazyQueryHookResult = ReturnType<typeof useMarketLiquidityLazyQuery>;
export type MarketLiquidityQueryResult = Apollo.QueryResult<MarketLiquidityQuery, MarketLiquidityQueryVariables>;