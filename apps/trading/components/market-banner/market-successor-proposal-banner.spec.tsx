import { render, screen } from '@testing-library/react';
import { MarketSuccessorProposalBanner } from './market-successor-proposal-banner';
import { ProposalState } from '@vegaprotocol/types';

const proposal = {
  __typename: 'Proposal' as const,
  id: 'proposal-1',
  state: ProposalState.STATE_OPEN,
  terms: {
    __typename: 'ProposalTerms' as const,
    closingDatetime: '2023-09-27',
    enactmentDatetime: '2023-09-28',
    change: {
      __typename: 'NewMarket' as const,
      instrument: {
        name: 'New proposal of the market successor',
      },
      successorConfiguration: {
        parentMarketId: 'marketId',
      },
    },
  },
};
const proposal2 = {
  __typename: 'Proposal' as const,
  id: 'proposal-2',
  state: ProposalState.STATE_OPEN,
  terms: {
    __typename: 'ProposalTerms' as const,
    closingDatetime: '2023-09-27',
    enactmentDatetime: '2023-09-28',
    change: {
      __typename: 'NewMarket' as const,
      instrument: {
        name: 'New second proposal of the market successor',
      },
      successorConfiguration: {
        parentMarketId: 'marketId',
      },
    },
  },
};

describe('MarketSuccessorProposalBanner', () => {
  it('should display single proposal', () => {
    render(<MarketSuccessorProposalBanner proposals={[proposal]} />);

    expect(
      screen.getByText('A successor to this market has been proposed')
    ).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining(proposal.id)
    );
  });

  it('should display plural proposals', () => {
    const proposals = [proposal, proposal2];
    render(<MarketSuccessorProposalBanner proposals={proposals} />);

    expect(
      screen.getByText('Successors to this market have been proposed')
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(proposals.length);
    expect(links[0]).toHaveAttribute(
      'href',
      expect.stringContaining(proposal.id)
    );
    expect(links[1]).toHaveAttribute(
      'href',
      expect.stringContaining(proposal2.id)
    );
  });
});
