import { render, screen } from '@testing-library/react';
import { ProposalFormTerms } from './proposal-form-terms';

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: () => ({
    VEGA_DOCS_URL: 'https://docs.vega.xyz',
  }),
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

  it('should render the generic docs link if no custom override', () => {
    renderComponent();
    expect(
      screen.getByText('https://docs.vega.xyz/tutorials/proposals')
    ).toBeInTheDocument();
  });

  it('should render the custom docs link if provided', () => {
    const register = jest.fn();
    render(
      <ProposalFormTerms
        registerField={register('proposalTerms')}
        errorMessage="Error text"
        customDocLink="/custom"
      />
    );
    expect(
      screen.getByText('https://docs.vega.xyz/tutorials/proposals/custom')
    ).toBeInTheDocument();
  });
});
