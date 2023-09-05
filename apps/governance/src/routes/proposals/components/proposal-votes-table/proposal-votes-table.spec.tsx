import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import { ProposalVotesTable } from './proposal-votes-table';
import { ProposalType } from '../proposal/proposal';
import {
  generateNoVotes,
  generateProposal,
  generateYesVotes,
} from '../../test-helpers/generate-proposals';

const defaultProposal = generateProposal();
const defaultProposalType = ProposalType.PROPOSAL_NETWORK_PARAMETER;
const updateMarketProposal = generateProposal({
  terms: {
    change: {
      __typename: 'UpdateMarket',
      marketId: '12345',
    },
  },
  votes: {
    __typename: 'ProposalVotes',
    yes: generateYesVotes(10),
    no: generateNoVotes(0),
  },
});
const updateMarketProposalType = ProposalType.PROPOSAL_UPDATE_MARKET;

const renderComponent = (
  proposal = defaultProposal,
  proposalType = defaultProposalType
) =>
  render(
    <MockedProvider>
      <AppStateProvider>
        <ProposalVotesTable proposal={proposal} proposalType={proposalType} />
      </AppStateProvider>
    </MockedProvider>
  );

describe('Proposal Votes Table', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should show vote breakdown fields, excluding custom update market fields', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('vote-breakdown-toggle'));
    expect(screen.getByText('Expected to pass')).toBeInTheDocument();
    expect(screen.getByText('Token majority met')).toBeInTheDocument();
    expect(screen.getByText('Token participation met')).toBeInTheDocument();
    expect(screen.getByText('Tokens for proposal')).toBeInTheDocument();
    expect(screen.getByText('Total Supply')).toBeInTheDocument();
    expect(screen.getByText('Tokens against proposal')).toBeInTheDocument();
    expect(screen.getByText('Participation required')).toBeInTheDocument();
    expect(screen.getByText('Majority Required')).toBeInTheDocument();
    expect(screen.getByText('Number of voting parties')).toBeInTheDocument();
    expect(screen.getByText('Total tokens voted')).toBeInTheDocument();
    expect(
      screen.getByText('Total tokens voted percentage')
    ).toBeInTheDocument();
    expect(screen.getByText('Number of votes for')).toBeInTheDocument();
    expect(screen.getByText('Number of votes against')).toBeInTheDocument();
    expect(screen.getByText('Yes percentage')).toBeInTheDocument();
    expect(screen.getByText('No percentage')).toBeInTheDocument();
    expect(screen.queryByText('Liquidity majority met')).toBeNull();
    expect(screen.queryByText('Liquidity participation met')).toBeNull();
    expect(screen.queryByText('Liquidity shares for proposal')).toBeNull();
  });

  it('displays different breakdown fields for update market proposal', () => {
    renderComponent(updateMarketProposal, updateMarketProposalType);
    fireEvent.click(screen.getByTestId('vote-breakdown-toggle'));
    expect(screen.getByText('Liquidity majority met')).toBeInTheDocument();
    expect(screen.getByText('Liquidity participation met')).toBeInTheDocument();
    expect(
      screen.getByText('Liquidity shares for proposal')
    ).toBeInTheDocument();
    expect(screen.queryByText('Number of voting parties')).toBeNull();
    expect(screen.queryByText('Total tokens voted')).toBeNull();
    expect(screen.queryByText('Total tokens voted percentage')).toBeNull();
    expect(screen.queryByText('Number of votes for')).toBeNull();
    expect(screen.queryByText('Number of votes against')).toBeNull();
    expect(screen.queryByText('Yes percentage')).toBeNull();
    expect(screen.queryByText('No percentage')).toBeNull();
  });

  it('displays if an update market proposal will pass by token vote', () => {
    renderComponent(updateMarketProposal, updateMarketProposalType);
    fireEvent.click(screen.getByTestId('vote-breakdown-toggle'));
    expect(screen.getByText('👍 by token vote')).toBeInTheDocument();
  });

  it('displays if an update market proposal will pass by LP vote', () => {
    renderComponent(
      generateProposal({
        terms: {
          change: {
            __typename: 'UpdateMarket',
            marketId: '12345',
          },
        },
        votes: {
          __typename: 'ProposalVotes',
          yes: {
            ...generateYesVotes(0, 1, '10'),
          },
          no: {
            ...generateNoVotes(0, 1, '0'),
          },
        },
      }),
      updateMarketProposalType
    );
    fireEvent.click(screen.getByTestId('vote-breakdown-toggle'));
    expect(screen.getByText('👍 by liquidity vote')).toBeInTheDocument();
  });
});
