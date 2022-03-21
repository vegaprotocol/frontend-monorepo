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

  it('should add classes passed in', () => {
    render(
      <FormGroup label="label" labelFor="test" className="fighter">
        <input id="test"></input>
      </FormGroup>
    );
    expect(screen.getByTestId('form-group')).toHaveClass('fighter');
  });

  it('should render children', () => {
    render(
      <FormGroup label="label" labelFor="test" className="fighter">
        <input data-testid="foo" id="test"></input>
      </FormGroup>
    );
    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });
});
