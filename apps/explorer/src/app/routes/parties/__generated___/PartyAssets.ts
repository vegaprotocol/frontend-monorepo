import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyAssetsQueryQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyAssetsQueryQuery = { __typename?: 'Query', party?: { __typename?: 'Party', id: string, stakingSummary: { __typename?: 'StakingSummary', currentStakeAvailable: string }, accounts?: Array<{ __typename?: 'AccountBalance', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', name: string, id: string, decimals: number, symbol: string, source: { __typename: 'BuiltinAsset' } | { __typename: 'ERC20', contractAddress: string } } }> | null } | null };


export const PartyAssetsQueryDocument = gql`
    query PartyAssetsQuery($partyId: ID!) {
  party(id: $partyId) {
    id
    stakingSummary {
      currentStakeAvailable
    }
    accounts {
      asset {
        name
        id
        decimals
        symbol
        source {
          __typename
          ... on ERC20 {
            contractAddress
          }
        }
      }
      type
      balance
    }
  }
}
    `;

/**
 * __usePartyAssetsQueryQuery__
 *
 * To run a query within a React component, call `usePartyAssetsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyAssetsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyAssetsQueryQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyAssetsQueryQuery(baseOptions: Apollo.QueryHookOptions<PartyAssetsQueryQuery, PartyAssetsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyAssetsQueryQuery, PartyAssetsQueryQueryVariables>(PartyAssetsQueryDocument, options);
      }
export function usePartyAssetsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyAssetsQueryQuery, PartyAssetsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyAssetsQueryQuery, PartyAssetsQueryQueryVariables>(PartyAssetsQueryDocument, options);
        }
export type PartyAssetsQueryQueryHookResult = ReturnType<typeof usePartyAssetsQueryQuery>;
export type PartyAssetsQueryLazyQueryHookResult = ReturnType<typeof usePartyAssetsQueryLazyQuery>;
export type PartyAssetsQueryQueryResult = Apollo.QueryResult<PartyAssetsQueryQuery, PartyAssetsQueryQueryVariables>;