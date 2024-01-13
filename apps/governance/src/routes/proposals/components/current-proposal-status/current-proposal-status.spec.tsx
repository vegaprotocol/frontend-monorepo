import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { ProposalRejectionReason, ProposalState } from '@vegaprotocol/types';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParamsDocument } from '@vegaprotocol/network-parameters';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { CurrentProposalStatus } from './current-proposal-status';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

const networkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NetworkParamsDocument,
  },
  result: {
    data: {
      networkParametersConnection: {
        edges: [
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.requiredMajority',
              value: '0.00000001',
            },
          },
          {
            node: {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateNetParam.requiredParticipation',
              value: '0.000000001',
            },
          },
        ],
      },
    },
  },
};

const renderComponent = ({
  proposal,
}: {
  proposal: Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>;
}) => {
  render(
    <AppStateProvider>
      <MockedProvider mocks={[networkParamsQueryMock]}>
        <CurrentProposalStatus proposal={proposal} />
      </MockedProvider>
    </AppStateProvider>
  );
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(60 * 60 * 1000);
});

afterEach(() => {
  jest.useRealTimers();
});

it('Proposal open - renders will fail state if the proposal will fail', async () => {
  const failedProposal = generateProposal({
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
    },
  });
  renderComponent({ proposal: failedProposal });
  expect(await screen.findByText('Currently expected to')).toBeInTheDocument();
  expect(await screen.findByText('fail.')).toBeInTheDocument();
});

it('Proposal open - renders will pass state if the proposal will pass', async () => {
  const proposal = generateProposal();

  renderComponent({ proposal });
  expect(await screen.findByText('Currently expected to')).toBeInTheDocument();
  expect(await screen.findByText('pass.')).toBeInTheDocument();
});

it('Proposal enacted - renders vote passed and time since enactment', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_ENACTED,
    terms: {
      enactmentDatetime: new Date(0).toISOString(),
    },
  });

  renderComponent({ proposal });
  expect(await screen.findByText('Vote passed.')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal passed - renders vote passed and time since vote closed', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_PASSED,
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
  });

  renderComponent({ proposal });
  expect(await screen.findByText('Vote passed.')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal waiting for node vote - will pass  - renders if the vote will pass and status', async () => {
  const failedProposal = generateProposal({
    state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
    },
  });
  renderComponent({ proposal: failedProposal });
  expect(
    await screen.findByText('Waiting for nodes to validate asset.')
  ).toBeInTheDocument();
  expect(await screen.findByText('Currently expected to')).toBeInTheDocument();
  expect(await screen.findByText('fail.')).toBeInTheDocument();
});

it('Proposal waiting for node vote - will fail - renders if the vote will pass and status', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Waiting for nodes to validate asset.')
  ).toBeInTheDocument();
  expect(await screen.findByText('Currently expected to')).toBeInTheDocument();
  expect(await screen.findByText('pass.')).toBeInTheDocument();
});

it('Proposal failed - renders vote failed reason and vote closed ago', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_FAILED,
    errorDetails: 'foo',
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Vote closed. Failed due to:')
  ).toBeInTheDocument();
  expect(await screen.findByText('foo')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal failed - renders rejection reason there are no error details', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_FAILED,
    rejectionReason: ProposalRejectionReason.PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE,
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Vote closed. Failed due to:')
  ).toBeInTheDocument();
  expect(
    await screen.findByText('PROPOSAL_ERROR_CLOSE_TIME_TOO_LATE')
  ).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal failed - renders unknown reason if there are no error details or rejection reason', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_FAILED,
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Vote closed. Failed due to:')
  ).toBeInTheDocument();
  expect(await screen.findByText('unknown reason')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal failed - renders participation not met if participation is not met', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_FAILED,
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
    },
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Vote closed. Failed due to:')
  ).toBeInTheDocument();
  expect(await screen.findByText('Participation not met')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal failed - renders majority not met if majority is not met', async () => {
  const proposal = generateProposal({
    state: ProposalState.STATE_FAILED,
    terms: {
      closingDatetime: new Date(0).toISOString(),
    },
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        totalEquityLikeShareWeight: '0',
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '1',
        totalTokens: '25242474195500835440000',
        totalEquityLikeShareWeight: '0',
      },
    },
  });

  renderComponent({ proposal });
  expect(
    await screen.findByText('Vote closed. Failed due to:')
  ).toBeInTheDocument();
  expect(await screen.findByText('Majority not met')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});
