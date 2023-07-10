import * as Types from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ProposalMarketsQueryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProposalMarketsQueryQuery = { __typename: 'Query', marketsConnection?: { __typename: 'MarketConnection', edges: Array<{ __typename: 'MarketEdge', node: { __typename: 'Market', id: string, tradableInstrument: { __typename: 'TradableInstrument', instrument: { __typename: 'Instrument', name: string, code: string } }, proposal?: { __typename: 'Proposal', state: Types.ProposalState } | null } }> } | null };


export const ProposalMarketsQueryDocument = gql`
    query ProposalMarketsQuery {
  marketsConnection {
    edges {
      node {
        id
        tradableInstrument {
          instrument {
            name
            code
          }
        }
        proposal {
          state
        }
      }
    }
  }
}
    `;

/**
 * __useProposalMarketsQueryQuery__
 *
 * To run a query within a React component, call `useProposalMarketsQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalMarketsQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalMarketsQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useProposalMarketsQueryQuery(baseOptions?: Apollo.QueryHookOptions<ProposalMarketsQueryQuery, ProposalMarketsQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalMarketsQueryQuery, ProposalMarketsQueryQueryVariables>(ProposalMarketsQueryDocument, options);
      }
export function useProposalMarketsQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalMarketsQueryQuery, ProposalMarketsQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalMarketsQueryQuery, ProposalMarketsQueryQueryVariables>(ProposalMarketsQueryDocument, options);
        }
export type ProposalMarketsQueryQueryHookResult = ReturnType<typeof useProposalMarketsQueryQuery>;
export type ProposalMarketsQueryLazyQueryHookResult = ReturnType<typeof useProposalMarketsQueryLazyQuery>;
export type ProposalMarketsQueryQueryResult = Apollo.QueryResult<ProposalMarketsQueryQuery, ProposalMarketsQueryQueryVariables>;