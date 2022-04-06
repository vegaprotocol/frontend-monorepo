import { render } from '@testing-library/react';

import Orderbook from './orderbook';

describe('Orderbook', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Orderbook />);
    expect(baseElement).toBeTruthy();
  });
});
