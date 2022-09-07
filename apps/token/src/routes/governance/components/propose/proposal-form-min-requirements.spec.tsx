import { render } from '@testing-library/react';
import { ProposalFormMinRequirements } from './proposal-form-min-requirements';

describe('ProposalFormMinRequirements', () => {
  it('should render successfully without value applied', () => {
    const { baseElement } = render(<ProposalFormMinRequirements />);
    expect(baseElement).toHaveTextContent(
      'You must have at least 1 VEGA associated to make a proposal'
    );
  });

  it('should render successfully with supplied value', () => {
    const { baseElement } = render(<ProposalFormMinRequirements value="2" />);
    expect(baseElement).toBeTruthy();

    expect(baseElement).toHaveTextContent(
      'You must have at least 2 VEGA associated to make a proposal'
    );
  });
});
