import {
  render,
  screen,
  act,
  waitFor,
  getAllByRole,
} from '@testing-library/react';
import merge from 'lodash/merge';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalsList } from './proposals-list';
import * as Types from '@vegaprotocol/types';
import { createProposalListFieldsFragment } from '../../lib/proposals-data-provider/proposals.mock';
import type { ProposalsListQuery } from '../../lib';
import { ProposalsListDocument } from '../../lib';
import type { PartialDeep } from 'type-fest';

describe('ProposalsList', () => {
  const createProposalsMock = (override?: PartialDeep<ProposalsListQuery>) => {
    const defaultProposalEdges = [
      {
        __typename: 'ProposalEdge' as const,
        node: createProposalListFieldsFragment({
          id: 'id-1',
          state: Types.ProposalState.STATE_OPEN,
        }),
      },
      {
        __typename: 'ProposalEdge' as const,
        node: createProposalListFieldsFragment({
          id: 'id-2',
          state: Types.ProposalState.STATE_PASSED,
        }),
      },
      {
        __typename: 'ProposalEdge' as const,
        node: createProposalListFieldsFragment({
          id: 'id-3',
          state: Types.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
        }),
      },
    ];
    const data = merge(
      {
        proposalsConnection: {
          __typename: 'ProposalsConnection' as const,
          edges: defaultProposalEdges,
        },
      },
      override
    );

    const mock: MockedResponse<ProposalsListQuery> = {
      request: {
        query: ProposalsListDocument,
        variables: {
          proposalType: Types.ProposalType.TYPE_NEW_MARKET,
        },
      },
      result: {
        data,
      },
    };

    return mock;
  };

  it('should be properly rendered', async () => {
    const mock = createProposalsMock();
    await act(() => {
      render(
        <MockedProvider mocks={[mock]}>
          <ProposalsList />
        </MockedProvider>
      );
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(3);
  });

  it('some of states should be filtered out', async () => {
    const mock = createProposalsMock({
      proposalsConnection: {
        edges: [
          {
            __typename: 'ProposalEdge',
            node: createProposalListFieldsFragment({
              id: 'id-1',
              state: Types.ProposalState.STATE_ENACTED,
            }),
          },
        ],
      },
    });
    await act(() => {
      render(
        <MockedProvider mocks={[mock]}>
          <ProposalsList />
        </MockedProvider>
      );
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
  });

  it('empty response should causes no data message display', async () => {
    const mock: MockedResponse<ProposalsListQuery> = {
      request: {
        query: ProposalsListDocument,
        variables: {
          proposalType: Types.ProposalType.TYPE_NEW_MARKET,
        },
      },
      result: {
        data: {
          proposalsConnection: {
            __typename: 'ProposalsConnection',
            edges: [],
          },
        },
      },
    };
    await act(() => {
      render(
        <MockedProvider mocks={[mock]}>
          <ProposalsList />
        </MockedProvider>
      );
    });
    expect(await screen.findByText('No markets')).toBeInTheDocument();
  });
});
