import { render, screen } from '@testing-library/react';
import { ProposalNotFound } from './proposal-not-found';

describe('Proposal container', () => {
  it('Renders not found if the proposal is not found', () => {
    render(<ProposalNotFound />);
    expect(screen.getByText('Proposal not found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The proposal you are looking for is not here, it may have been enacted before the last chain re-store. You could check forums/discord instead.'
      )
    ).toBeInTheDocument();
  });
});
