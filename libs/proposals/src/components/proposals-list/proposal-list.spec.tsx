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
import { FLAGS } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/environment', () => {
  const actual = jest.requireActual('@vegaprotocol/environment');
  return {
    ...actual,
    FLAGS: {
      ...actual.FLAGS,
      SUCCESSOR_MARKETS: true,
    },
  };
});

const successorMarketName = 'Successor Market Name';
const spySuccessorMarketRenderer = jest
  .fn()
  .mockReturnValue(successorMarketName);

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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should be properly rendered', async () => {
    const mock = createProposalsMock();
    await act(() => {
      render(
        <MockedProvider mocks={[mock]}>
          <ProposalsList SuccessorMarketRenderer={spySuccessorMarketRenderer} />
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
    const proposalNode = createProposalListFieldsFragment({
      id: 'id-1',
      state: Types.ProposalState.STATE_ENACTED,
    });

    const mock = createProposalsMock({
      proposalsConnection: {
        edges: [
          {
            __typename: 'ProposalEdge',
            node: {
              ...proposalNode,
              terms: {
                ...proposalNode.terms,
                change: {
                  ...proposalNode.terms.change,
                },
              },
            },
          },
        ],
      },
    } as PartialDeep<ProposalsListQuery>);
    await act(() => {
      render(
        <MockedProvider mocks={[mock]}>
          <ProposalsList SuccessorMarketRenderer={spySuccessorMarketRenderer} />
        </MockedProvider>
      );
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
      expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
    });

    expect(spySuccessorMarketRenderer).toHaveBeenCalled();
    expect(
      screen.getByRole('columnheader', {
        name: (_name, element) =>
          element.getAttribute('col-id') === 'parentMarket',
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('gridcell', {
        name: (name, element) =>
          element.getAttribute('col-id') === 'parentMarket',
      })[0]
    ).toHaveTextContent(successorMarketName);
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
          <ProposalsList SuccessorMarketRenderer={spySuccessorMarketRenderer} />
        </MockedProvider>
      );
    });
    expect(await screen.findByText('No markets')).toBeInTheDocument();

    expect(
      screen.getByRole('columnheader', {
        name: (_name, element) =>
          element.getAttribute('col-id') === 'parentMarket',
      })
    ).toBeInTheDocument();
  });

  it('feature flag should hide parent marketcolumn', async () => {
    const mockedFlags = jest.mocked(FLAGS);
    mockedFlags.SUCCESSOR_MARKETS = false;
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
          <ProposalsList SuccessorMarketRenderer={spySuccessorMarketRenderer} />
        </MockedProvider>
      );
    });
    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', {
          name: (_name, element) => element.getAttribute('col-id') === 'market',
        })
      ).toBeInTheDocument();
    });
    screen.getAllByRole('columnheader').forEach((element) => {
      expect(element.getAttribute('col-id')).not.toEqual('parentMarket');
    });
  });
});
