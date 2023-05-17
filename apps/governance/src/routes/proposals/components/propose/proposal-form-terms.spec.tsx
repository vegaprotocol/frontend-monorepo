import { render, screen } from '@testing-library/react';
import { ProposalFormTerms } from './proposal-form-terms';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  DocsLinks: {
    PROPOSALS_GUIDE: 'https://docs.vega.xyz/tutorials/proposals',
  },
}));

const renderComponent = () => {
  const register = jest.fn();
  render(
    <ProposalFormTerms
      registerField={register('proposalTerms')}
      errorMessage="Error text"
    />
  );
};

describe('Proposal Form Terms', () => {
  it('should render', () => {
    renderComponent();
    expect(screen.getByTestId('proposal-terms')).toBeTruthy();
  });

  it('should display error text', () => {
    renderComponent();
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });

  it('should render the docs link', () => {
    const register = jest.fn();
    render(
      <ProposalFormTerms
        registerField={register('proposalTerms')}
        errorMessage="Error text"
        docsLink="/custom"
      />
    );
    expect(
      screen.getByText('https://docs.vega.xyz/tutorials/proposals/custom')
    ).toBeInTheDocument();
  });
});
