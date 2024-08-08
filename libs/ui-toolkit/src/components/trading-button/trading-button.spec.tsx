import { render } from '@testing-library/react';

import { TradingButton } from './trading-button';

describe('TradingButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingButton size="sm" />);
    expect(baseElement).toBeTruthy();
  });
});
