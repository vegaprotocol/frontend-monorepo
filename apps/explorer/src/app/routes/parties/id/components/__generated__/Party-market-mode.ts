import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ExplorerPartyMarginModeQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
  marketId: Types.Scalars['ID'];
}>;


export type ExplorerPartyMarginModeQuery = { __typename?: 'Query', partyMarginModes?: { __typename?: 'PartyMarginModesConnection', edges?: Array<{ __typename?: 'PartyMarginModeEdge', node: { __typename?: 'PartyMarginMode', atEpoch: number, partyId: string, marketId: string, marginMode: Types.MarginMode, marginFactor?: string | null, maxTheoreticalLeverage?: string | null, minTheoreticalMarginFactor?: string | null } } | null> | null } | null };


export const ExplorerPartyMarginModeDocument = gql`
    query ExplorerPartyMarginMode($partyId: ID!, $marketId: ID!) {
  partyMarginModes(partyId: $partyId, marketId: $marketId) {
    edges {
      node {
        atEpoch
        partyId
        marketId
        marginMode
        marginFactor
        maxTheoreticalLeverage
        minTheoreticalMarginFactor
      }
    }
  }
}
    `;

/**
 * __useExplorerPartyMarginModeQuery__
 *
 * To run a query within a React component, call `useExplorerPartyMarginModeQuery` and pass it any options that fit your needs.
 * When your component renders, `useExplorerPartyMarginModeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExplorerPartyMarginModeQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *      marketId: // value for 'marketId'
 *   },
 * });
 */
export function useExplorerPartyMarginModeQuery(baseOptions: Apollo.QueryHookOptions<ExplorerPartyMarginModeQuery, ExplorerPartyMarginModeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExplorerPartyMarginModeQuery, ExplorerPartyMarginModeQueryVariables>(ExplorerPartyMarginModeDocument, options);
      }
export function useExplorerPartyMarginModeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExplorerPartyMarginModeQuery, ExplorerPartyMarginModeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExplorerPartyMarginModeQuery, ExplorerPartyMarginModeQueryVariables>(ExplorerPartyMarginModeDocument, options);
        }
export type ExplorerPartyMarginModeQueryHookResult = ReturnType<typeof useExplorerPartyMarginModeQuery>;
export type ExplorerPartyMarginModeLazyQueryHookResult = ReturnType<typeof useExplorerPartyMarginModeLazyQuery>;
export type ExplorerPartyMarginModeQueryResult = Apollo.QueryResult<ExplorerPartyMarginModeQuery, ExplorerPartyMarginModeQueryVariables>;