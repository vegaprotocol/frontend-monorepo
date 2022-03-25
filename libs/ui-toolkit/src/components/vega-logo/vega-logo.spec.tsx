import { render } from '@testing-library/react';

import { VegaLogo } from './vega-logo';

describe('Vega logo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VegaLogo />);
    expect(baseElement).toBeTruthy();
  });
});
