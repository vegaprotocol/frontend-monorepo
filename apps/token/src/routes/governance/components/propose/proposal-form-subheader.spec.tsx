import { render, screen } from '@testing-library/react';
import { ProposalFormSubheader } from './proposal-form-subheader';

describe('Proposal Form Subheader', () => {
  it('should display subheader text', () => {
    render(<ProposalFormSubheader>Test</ProposalFormSubheader>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
