import { render } from '@testing-library/react';
import { ProposalFormMinRequirements } from './proposal-form-min-requirements';

describe('ProposalFormMinRequirements', () => {
  it('should render successfully with spam protection value, if larger', () => {
    const { baseElement } = render(
      <ProposalFormMinRequirements
        minProposerBalance="1000000000000000000"
        spamProtectionMin="2000000000000000000"
      />
    );
    expect(baseElement).toBeTruthy();

    expect(baseElement).toHaveTextContent(
      'You must have at least 2 VEGA associated to make a proposal'
    );
  });

  it('should render successfully with min proposer value, if larger', () => {
    const { baseElement } = render(
      <ProposalFormMinRequirements
        minProposerBalance="3000000000000000000"
        spamProtectionMin="1000000000000000000"
      />
    );
    expect(baseElement).toBeTruthy();

    expect(baseElement).toHaveTextContent(
      'You must have at least 3 VEGA associated to make a proposal'
    );
  });
});
