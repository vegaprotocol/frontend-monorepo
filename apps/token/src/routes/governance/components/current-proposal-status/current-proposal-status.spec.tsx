import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { NETWORK_PARAMETERS_QUERY } from '@vegaprotocol/react-helpers';
import { ProposalState } from '@vegaprotocol/types';
import type { NetworkParamsQuery } from '@vegaprotocol/web3';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { generateProposal } from '../../test-helpers/generate-proposals';
import type { ProposalFields } from '../../__generated__/ProposalFields';
import { CurrentProposalStatus } from './current-proposal-status';

const networkParamsQueryMock: MockedResponse<NetworkParamsQuery> = {
  request: {
    query: NETWORK_PARAMETERS_QUERY,
  },
  result: {
    data: {
      networkParameters: [
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.updateNetParam.requiredMajority',
          value: '0.00000001',
        },
        {
          __typename: 'NetworkParameter',
          key: 'governance.proposal.updateNetParam.requiredParticipation',
          value: '0.000000001',
        },
      ],
    },
  },
};

const renderComponent = ({ proposal }: { proposal: ProposalFields }) => {
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
  const proposal = generateProposal();
  const failedProposal: ProposalFields = {
    ...proposal,
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        votes: null,
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        votes: null,
      },
    },
  };
  renderComponent({ proposal: failedProposal });
  expect(await screen.findByText('Vote currently set to')).toBeInTheDocument();
  expect(await screen.findByText('fail')).toBeInTheDocument();
});

it('Proposal open - renders will pass state if the proposal will pass', async () => {
  const proposal = generateProposal();

  renderComponent({ proposal });
  expect(await screen.findByText('Vote currently set to')).toBeInTheDocument();
  expect(await screen.findByText('pass')).toBeInTheDocument();
});

it('Proposal enacted - renders vote passed and time since enactment', async () => {
  const proposal = generateProposal();

  renderComponent({
    proposal: {
      ...proposal,
      state: ProposalState.STATE_ENACTED,
      terms: {
        ...proposal.terms,
        enactmentDatetime: new Date(0).toISOString(),
      },
    },
  });
  expect(await screen.findByText('Vote passed.')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal passed - renders vote passed and time since vote closed', async () => {
  const proposal = generateProposal();

  renderComponent({
    proposal: {
      ...proposal,
      state: ProposalState.STATE_PASSED,
      terms: {
        ...proposal.terms,
        closingDatetime: new Date(0).toISOString(),
      },
    },
  });
  expect(await screen.findByText('Vote passed.')).toBeInTheDocument();
  expect(await screen.findByText('about 1 hour ago')).toBeInTheDocument();
});

it('Proposal waiting for node vote - will pass  - renders if the vote will pass and status', async () => {
  const proposal = generateProposal();
  const failedProposal: ProposalFields = {
    ...proposal,
    state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    votes: {
      __typename: 'ProposalVotes',
      yes: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        votes: null,
      },
      no: {
        __typename: 'ProposalVoteSide',
        totalNumber: '0',
        totalTokens: '0',
        votes: null,
      },
    },
  };
  renderComponent({ proposal: failedProposal });
  expect(
    await screen.findByText('Waiting for nodes to validate asset.')
  ).toBeInTheDocument();
  expect(await screen.findByText('Vote currently set to')).toBeInTheDocument();
  expect(await screen.findByText('fail')).toBeInTheDocument();
});

it('Proposal waiting for node vote - will fail - renders if the vote will pass and status', async () => {
  const proposal = generateProposal();

  renderComponent({
    proposal: {
      ...proposal,
      state: ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    },
  });
  expect(
    await screen.findByText('Waiting for nodes to validate asset.')
  ).toBeInTheDocument();
  expect(await screen.findByText('Vote currently set to')).toBeInTheDocument();
  expect(await screen.findByText('pass')).toBeInTheDocument();
});
