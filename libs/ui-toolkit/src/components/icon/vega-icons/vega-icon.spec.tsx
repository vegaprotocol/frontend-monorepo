import { render } from '@testing-library/react';

import { VegaIcon } from './vega-icon';
import { VegaIconNames } from './vega-icon-record';

describe('VegaIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VegaIcon name={VegaIconNames.TWITTER} />);
    expect(baseElement).toBeTruthy();
  });
});
