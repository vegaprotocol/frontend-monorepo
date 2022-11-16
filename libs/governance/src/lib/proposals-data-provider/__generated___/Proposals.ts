import { Schema as Types } from '@vegaprotocol/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NewMarketFieldsFragment = { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } };

export type ProposalListFieldsFragment = { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateNetworkParameter' } } };

export type ProposalsListQueryVariables = Types.Exact<{
  proposalType?: Types.InputMaybe<Types.ProposalType>;
  inState?: Types.InputMaybe<Types.ProposalState>;
}>;


export type ProposalsListQuery = { __typename?: 'Query', proposalsConnection?: { __typename?: 'ProposalsConnection', edges?: Array<{ __typename?: 'ProposalEdge', node: { __typename?: 'Proposal', id?: string | null, reference: string, state: Types.ProposalState, datetime: string, votes: { __typename?: 'ProposalVotes', yes: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string }, no: { __typename?: 'ProposalVoteSide', totalTokens: string, totalNumber: string, totalWeight: string } }, terms: { __typename?: 'ProposalTerms', closingDatetime: string, enactmentDatetime?: string | null, change: { __typename?: 'NewAsset' } | { __typename?: 'NewFreeform' } | { __typename?: 'NewMarket', instrument: { __typename?: 'InstrumentConfiguration', code: string, name: string, futureProduct?: { __typename?: 'FutureProduct', settlementAsset: { __typename?: 'Asset', id: string, name: string, symbol: string } } | null } } | { __typename?: 'UpdateAsset' } | { __typename?: 'UpdateMarket' } | { __typename?: 'UpdateNetworkParameter' } } } } | null> | null } | null };

export const NewMarketFieldsFragmentDoc = gql`
    fragment NewMarketFields on NewMarket {
  instrument {
    code
    name
    futureProduct {
      settlementAsset {
        id
        name
        symbol
      }
    }
  }
}
    `;
export const ProposalListFieldsFragmentDoc = gql`
    fragment ProposalListFields on Proposal {
  id
  reference
  state
  datetime
  votes {
    yes {
      totalTokens
      totalNumber
      totalWeight
    }
    no {
      totalTokens
      totalNumber
      totalWeight
    }
  }
  terms {
    closingDatetime
    enactmentDatetime
    change {
      ... on NewMarket {
        ...NewMarketFields
      }
    }
  }
}
    ${NewMarketFieldsFragmentDoc}`;
export const ProposalsListDocument = gql`
    query ProposalsList($proposalType: ProposalType, $inState: ProposalState) {
  proposalsConnection(proposalType: $proposalType, inState: $inState) {
    edges {
      node {
        ...ProposalListFields
      }
    }
  }
}
    ${ProposalListFieldsFragmentDoc}`;

/**
 * __useProposalsListQuery__
 *
 * To run a query within a React component, call `useProposalsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsListQuery({
 *   variables: {
 *      proposalType: // value for 'proposalType'
 *      inState: // value for 'inState'
 *   },
 * });
 */
export function useProposalsListQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsListQuery, ProposalsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsListQuery, ProposalsListQueryVariables>(ProposalsListDocument, options);
      }
export function useProposalsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsListQuery, ProposalsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsListQuery, ProposalsListQueryVariables>(ProposalsListDocument, options);
        }
export type ProposalsListQueryHookResult = ReturnType<typeof useProposalsListQuery>;
export type ProposalsListLazyQueryHookResult = ReturnType<typeof useProposalsListLazyQuery>;
export type ProposalsListQueryResult = Apollo.QueryResult<ProposalsListQuery, ProposalsListQueryVariables>;