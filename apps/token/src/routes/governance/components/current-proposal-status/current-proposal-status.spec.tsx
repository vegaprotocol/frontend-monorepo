import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { NETWORK_PARAMETERS_QUERY } from '@vegaprotocol/react-helpers';
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
