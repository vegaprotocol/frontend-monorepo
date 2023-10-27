import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MarketNodeFragment = { __typename?: 'Market', id: string, liquidityProvisions?: { __typename?: 'LiquidityProvisionsWithPendingConnection', edges?: Array<{ __typename?: 'LiquidityProvisionWithPendingEdge', node: { __typename?: 'LiquidityProvisionWithPending', current: { __typename?: 'LiquidityProvision', commitmentAmount: string, fee: string } } } | null> | null } | null, data?: { __typename?: 'MarketData', targetStake?: string | null } | null };

export type LiquidityProvisionMarketsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type LiquidityProvisionMarketsQuery = { __typename?: 'Query', marketsConnection?: { __typename?: 'MarketConnection', edges: Array<{ __typename?: 'MarketEdge', node: { __typename?: 'Market', id: string, liquidityProvisions?: { __typename?: 'LiquidityProvisionsWithPendingConnection', edges?: Array<{ __typename?: 'LiquidityProvisionWithPendingEdge', node: { __typename?: 'LiquidityProvisionWithPending', current: { __typename?: 'LiquidityProvision', commitmentAmount: string, fee: string } } } | null> | null } | null, data?: { __typename?: 'MarketData', targetStake?: string | null } | null } }> } | null };

export const MarketNodeFragmentDoc = gql`
    fragment MarketNode on Market {
  id
  liquidityProvisions(live: true) {
    edges {
      node {
        current {
          commitmentAmount
          fee
        }
      }
    }
  }
  data {
    targetStake
  }
}
    `;
export const LiquidityProvisionMarketsDocument = gql`
    query LiquidityProvisionMarkets {
  marketsConnection {
    edges {
      node {
        ...MarketNode
      }
    }
  }
}
    ${MarketNodeFragmentDoc}`;

/**
 * __useLiquidityProvisionMarketsQuery__
 *
 * To run a query within a React component, call `useLiquidityProvisionMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLiquidityProvisionMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidityProvisionMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useLiquidityProvisionMarketsQuery(baseOptions?: Apollo.QueryHookOptions<LiquidityProvisionMarketsQuery, LiquidityProvisionMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LiquidityProvisionMarketsQuery, LiquidityProvisionMarketsQueryVariables>(LiquidityProvisionMarketsDocument, options);
      }
export function useLiquidityProvisionMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LiquidityProvisionMarketsQuery, LiquidityProvisionMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LiquidityProvisionMarketsQuery, LiquidityProvisionMarketsQueryVariables>(LiquidityProvisionMarketsDocument, options);
        }
export type LiquidityProvisionMarketsQueryHookResult = ReturnType<typeof useLiquidityProvisionMarketsQuery>;
export type LiquidityProvisionMarketsLazyQueryHookResult = ReturnType<typeof useLiquidityProvisionMarketsLazyQuery>;
export type LiquidityProvisionMarketsQueryResult = Apollo.QueryResult<LiquidityProvisionMarketsQuery, LiquidityProvisionMarketsQueryVariables>;