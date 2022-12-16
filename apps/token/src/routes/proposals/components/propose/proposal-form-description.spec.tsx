import { render, screen } from '@testing-library/react';
import { ProposalFormDescription } from './proposal-form-description';

describe('Proposal Form Description', () => {
  it('should display error text', () => {
    const register = jest.fn();
    render(
      <ProposalFormDescription
        registerField={register('proposalDescription')}
        errorMessage="Error text"
      />
    );
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });
});
