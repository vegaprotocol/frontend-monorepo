import { render } from '@testing-library/react';

import TradingButton from './trading-button';

describe('TradingButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingButton />);
    expect(baseElement).toBeTruthy();
  });
});
