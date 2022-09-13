import { render, screen } from '@testing-library/react';
import { ProposalFormSubmit } from './proposal-form-submit';

describe('Proposal Form Submit', () => {
  it('should render successfully', () => {
    render(<ProposalFormSubmit isSubmitting={false} />);
    expect(screen.getByTestId('proposal-submit')).toBeTruthy();
  });

  it('should display submitting text', () => {
    render(<ProposalFormSubmit isSubmitting={true} />);
    expect(screen.getByText('Submitting Proposal')).toBeInTheDocument();
  });

  it('should display submit text', () => {
    render(<ProposalFormSubmit isSubmitting={false} />);
    expect(screen.getByText('Submit Proposal')).toBeInTheDocument();
  });
});
