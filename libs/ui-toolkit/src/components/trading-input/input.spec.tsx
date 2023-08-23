import { render } from '@testing-library/react';

import { TradingInput } from './input';

describe('Input', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingInput />);
    expect(baseElement).toBeTruthy();
  });
});
