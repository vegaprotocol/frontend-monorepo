import { render } from '@testing-library/react';

import { VegaIcon } from './vega-icon';

describe('VegaIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VegaIcon name="twitter" />);
    expect(baseElement).toBeTruthy();
  });
});
