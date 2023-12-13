import { render, screen } from '@testing-library/react';
import { ProposalState } from '@vegaprotocol/types';
import { MarketUpdateBanner } from './market-update-banner';
import { type MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';

describe('MarketUpdateBanner', () => {
  const change = {
    __typename: 'UpdateMarket' as const,
    marketId: 'update-market-id',
  };

  const openProposal = {
    __typename: 'Proposal' as const,
    id: 'proposal-1',
    state: ProposalState.STATE_OPEN,
    terms: {
      __typename: 'ProposalTerms' as const,
      closingDatetime: '2023-09-27',
      enactmentDatetime: '2023-09-28',
      change,
    },
  };
  const passedProposal = {
    __typename: 'Proposal' as const,
    id: 'proposal-2',
    state: ProposalState.STATE_PASSED,
    terms: {
      __typename: 'ProposalTerms' as const,
      closingDatetime: '2023-09-27',
      enactmentDatetime: '2023-09-28',
      change,
    },
  };

  it('renders content for a single open proposal', () => {
    render(
      <MarketUpdateBanner
        proposals={[openProposal as MarketViewProposalFieldsFragment]}
      />
    );

    expect(
      screen.getByText(/^changes have been proposed/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View proposal' })).toHaveAttribute(
      'href',
      expect.stringContaining(openProposal.id as string)
    );
  });

  it('renders content for a single passed proposal', () => {
    render(
      <MarketUpdateBanner
        proposals={[passedProposal as MarketViewProposalFieldsFragment]}
      />
    );

    expect(
      screen.getByText(/^proposal set to change market/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View proposal' })).toHaveAttribute(
      'href',
      expect.stringContaining(passedProposal.id)
    );
  });

  it('renders content for multiple passed proposals', () => {
    const proposals = [
      openProposal,
      openProposal,
    ] as MarketViewProposalFieldsFragment[];

    render(<MarketUpdateBanner proposals={proposals} />);

    expect(
      screen.getByText(
        new RegExp(`^There are ${proposals.length} open proposals`)
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View proposals' })
    ).toHaveAttribute('href', expect.stringContaining('proposals'));
  });
});
