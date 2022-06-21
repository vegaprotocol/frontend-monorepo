import { render } from '@testing-library/react';

import Fills from './fills';

describe('Fills', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Fills />);
    expect(baseElement).toBeTruthy();
  });
});
