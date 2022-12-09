import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyMarketDataQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyMarketDataQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, accountsConnection?: { __typename?: 'AccountsConnection', edges?: Array<{ __typename?: 'AccountEdge', node: { __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, decimals: number }, market?: { __typename?: 'Market', id: string } | null } } | null> | null } | null, marginsConnection?: { __typename?: 'MarginConnection', edges?: Array<{ __typename?: 'MarginEdge', node: { __typename?: 'MarginLevels', initialLevel: string, maintenanceLevel: string, searchLevel: string, market: { __typename?: 'Market', id: string } } }> | null } | null } | null };


export const PartyMarketDataDocument = gql`
    query PartyMarketData($partyId: ID!) {
  party(id: $partyId) {
    id
    accountsConnection {
      edges {
        node {
          type
          balance
          asset {
            id
            decimals
          }
          market {
            id
          }
        }
      }
    }
    marginsConnection {
      edges {
        node {
          market {
            id
          }
          initialLevel
          maintenanceLevel
          searchLevel
        }
      }
    }
  }
}
    `;

/**
 * __usePartyMarketDataQuery__
 *
 * To run a query within a React component, call `usePartyMarketDataQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyMarketDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyMarketDataQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyMarketDataQuery(baseOptions: Apollo.QueryHookOptions<PartyMarketDataQuery, PartyMarketDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyMarketDataQuery, PartyMarketDataQueryVariables>(PartyMarketDataDocument, options);
      }
export function usePartyMarketDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyMarketDataQuery, PartyMarketDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyMarketDataQuery, PartyMarketDataQueryVariables>(PartyMarketDataDocument, options);
        }
export type PartyMarketDataQueryHookResult = ReturnType<typeof usePartyMarketDataQuery>;
export type PartyMarketDataLazyQueryHookResult = ReturnType<typeof usePartyMarketDataLazyQuery>;
export type PartyMarketDataQueryResult = Apollo.QueryResult<PartyMarketDataQuery, PartyMarketDataQueryVariables>;