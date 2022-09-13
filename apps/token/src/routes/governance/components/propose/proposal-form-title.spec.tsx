import { render, screen } from '@testing-library/react';
import { ProposalFormTitle } from './proposal-form-title';

describe('Proposal Form Title', () => {
  it('should render successfully', () => {
    const register = jest.fn();
    render(
      <ProposalFormTitle
        registerField={register('proposalTitle')}
        errorMessage={undefined}
      />
    );
    expect(screen.getByTestId('proposal-title')).toBeTruthy();
  });

  it('should display error text', () => {
    const register = jest.fn();
    render(
      <ProposalFormTitle
        registerField={register('proposalTitle')}
        errorMessage="Error text"
      />
    );
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });
});
