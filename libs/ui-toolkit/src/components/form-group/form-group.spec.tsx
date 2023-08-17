import { render, screen } from '@testing-library/react';

import { FormGroup } from './form-group';

describe('FormGroup', () => {
  it('should render label if given a label', () => {
    render(
      <FormGroup label="label" labelFor="test">
        <input id="test"></input>
      </FormGroup>
    );
    expect(screen.getByLabelText('label')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <FormGroup label="label" labelFor="test">
        <input data-testid="foo" id="test"></input>
      </FormGroup>
    );
    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
