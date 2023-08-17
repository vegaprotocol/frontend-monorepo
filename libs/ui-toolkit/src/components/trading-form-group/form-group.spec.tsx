import { render, screen } from '@testing-library/react';

import { TradingFormGroup } from './form-group';

describe('FormGroup', () => {
  it('should render label if given a label', () => {
    render(
      <TradingFormGroup label="label" labelFor="test">
        <input id="test"></input>
      </TradingFormGroup>
    );
    expect(screen.getByLabelText('label')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <TradingFormGroup label="label" labelFor="test">
        <input data-testid="foo" id="test"></input>
      </TradingFormGroup>
    );
    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
