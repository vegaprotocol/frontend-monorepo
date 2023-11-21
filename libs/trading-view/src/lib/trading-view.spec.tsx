import { render } from '@testing-library/react';

import TradingView from './trading-view';

describe('TradingView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TradingView />);
    expect(baseElement).toBeTruthy();
  });
});
