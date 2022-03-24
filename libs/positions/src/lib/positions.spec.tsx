import { render } from '@testing-library/react';

import Positions from './positions';

describe('Positions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Positions />);
    expect(baseElement).toBeTruthy();
  });
});
