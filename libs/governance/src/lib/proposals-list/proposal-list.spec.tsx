import {
  render,
  screen,
  act,
  waitFor,
  getAllByRole,
} from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ProposalsList } from './proposals-list';
import type { ProposalListFieldsFragment } from '../proposals-data-provider';
import * as Types from '@vegaprotocol/types';

const votesMock = {
  yes: {
    totalTokens: '5000',
  },
  no: {
    totalTokens: '2000',
  },
};
let marketsProposalMock: ProposalListFieldsFragment[] | null = [
  {
    id: 'id-1',
    state: Types.ProposalState.STATE_OPEN,
    votes: { ...votesMock },
  },
  {
    id: 'id-2',
    state: Types.ProposalState.STATE_PASSED,
    votes: { ...votesMock },
  },
  {
    id: 'id-3',
    state: Types.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    votes: { ...votesMock },
  },
] as ProposalListFieldsFragment[];

const useDataProvider = () => {
  return {
    data: marketsProposalMock,
    loading: false,
    error: false,
  };
};
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useDataProvider: jest.fn(() => useDataProvider()),
}));

describe('ProposalsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly rendered', async () => {
    await act(() => {
      render(<ProposalsList />, { wrapper: MockedProvider });
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(3);
  });

  it('some of states should be filtered out', async () => {
    marketsProposalMock = [
      {
        ...(marketsProposalMock as ProposalListFieldsFragment[])[0],
        state: Types.ProposalState.STATE_ENACTED,
      },
      ...(marketsProposalMock as ProposalListFieldsFragment[]).slice(1),
    ];
    await act(() => {
      render(<ProposalsList />, { wrapper: MockedProvider });
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(getAllByRole(container as HTMLDivElement, 'row')).toHaveLength(2);
  });

  it('empty response should causes no data message display', async () => {
    marketsProposalMock = null;
    await act(() => {
      render(<ProposalsList />, { wrapper: MockedProvider });
    });
    const container = document.querySelector('.ag-center-cols-container');
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
    expect(screen.getByText('No Rows To Show')).toBeInTheDocument();
  });
});
