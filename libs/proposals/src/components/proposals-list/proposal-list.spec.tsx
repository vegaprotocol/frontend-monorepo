import { render, screen, waitFor, within } from '@testing-library/react';
import merge from 'lodash/merge';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalsList } from './proposals-list';
import * as Types from '@vegaprotocol/types';
import { createProposalListFieldsFragment } from '../../lib/proposals-data-provider/proposals.mock';
import type { ProposalsListQuery } from '../../lib';
import { ProposalsListDocument } from '../../lib';
import type { PartialDeep } from 'type-fest';

const parentMarketName = 'Parent Market Name';
const ParentMarketCell = () => <span>{parentMarketName}</span>;

describe('ProposalsList', () => {
  const rowContainerSelector = '.ag-center-cols-container';

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
    render(
      <MockedProvider mocks={[mock]}>
        <ProposalsList cellRenderers={{ ParentMarketCell }} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(document.querySelector(rowContainerSelector)).toBeInTheDocument();
    });

    const expectedHeaders = [
      'Market',
      'Settlement asset',
      'State',
      'Parent market',
      'Voting',
      'Closing date',
      'Enactment date',
      '', // actions col
    ];

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(
      headers.map((h) => h.querySelector('[ref="eText"]')?.textContent?.trim())
    ).toEqual(expectedHeaders);

    const container = within(
      document.querySelector(rowContainerSelector) as HTMLElement
    );

    expect(await container.findAllByRole('row')).toHaveLength(
      // @ts-ignore data is mocked
      mock?.result?.data.proposalsConnection.edges.length
    );

    expect(
      container.getAllByRole('gridcell', {
        name: (_, element) =>
          element.getAttribute('col-id') ===
          'terms.change.successorConfiguration.parentMarketId',
      })[0]
    ).toHaveTextContent(parentMarketName);
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
    render(
      <MockedProvider mocks={[mock]}>
        <ProposalsList cellRenderers={{ ParentMarketCell }} />
      </MockedProvider>
    );
    expect(await screen.findByText('No proposed markets')).toBeInTheDocument();
  });
});
