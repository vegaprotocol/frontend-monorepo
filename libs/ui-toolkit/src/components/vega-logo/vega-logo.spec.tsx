import { render } from '@testing-library/react';

import { VegaLogo, VLogo } from './vega-logo';

describe('Vega logo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VegaLogo />);
    expect(baseElement).toBeTruthy();
  });

  it('V version should render successfully', () => {
    const { baseElement } = render(<VLogo />);
    expect(baseElement).toBeTruthy();
  });
});
