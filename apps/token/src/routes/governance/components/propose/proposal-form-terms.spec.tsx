import { render, screen } from '@testing-library/react';
import { ProposalFormTerms } from './proposal-form-terms';

describe('Proposal Form Terms', () => {
  it('should display error text', () => {
    const register = jest.fn();
    render(
      <ProposalFormTerms
        registerField={register('proposalTerms')}
        errorMessage="Error text"
      />
    );
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });
});
