import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PartyBalanceQueryVariables = Types.Exact<{
  partyId: Types.Scalars['ID'];
}>;


export type PartyBalanceQuery = { __typename?: 'Query', party?: { __typename?: 'Party', accounts?: Array<{ __typename?: 'Account', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } }> | null } | null };

export type AccountFragment = { __typename?: 'Account', type: Types.AccountType, balance: string, asset: { __typename?: 'Asset', id: string, symbol: string, name: string, decimals: number } };

export const AccountFragmentDoc = gql`
    fragment Account on Account {
  type
  balance
  asset {
    id
    symbol
    name
    decimals
  }
}
    `;
export const PartyBalanceDocument = gql`
    query PartyBalance($partyId: ID!) {
  party(id: $partyId) {
    accounts {
      ...Account
    }
  }
}
    ${AccountFragmentDoc}`;

/**
 * __usePartyBalanceQuery__
 *
 * To run a query within a React component, call `usePartyBalanceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePartyBalanceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePartyBalanceQuery({
 *   variables: {
 *      partyId: // value for 'partyId'
 *   },
 * });
 */
export function usePartyBalanceQuery(baseOptions: Apollo.QueryHookOptions<PartyBalanceQuery, PartyBalanceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PartyBalanceQuery, PartyBalanceQueryVariables>(PartyBalanceDocument, options);
      }
export function usePartyBalanceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PartyBalanceQuery, PartyBalanceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PartyBalanceQuery, PartyBalanceQueryVariables>(PartyBalanceDocument, options);
        }
export type PartyBalanceQueryHookResult = ReturnType<typeof usePartyBalanceQuery>;
export type PartyBalanceLazyQueryHookResult = ReturnType<typeof usePartyBalanceLazyQuery>;
export type PartyBalanceQueryResult = Apollo.QueryResult<PartyBalanceQuery, PartyBalanceQueryVariables>;