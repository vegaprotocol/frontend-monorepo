import { render } from '@testing-library/react';
import { MarketSelectorButton } from './market-selector-button';

describe('MarketSelectorButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MarketSelectorButton size="small" />);
    expect(baseElement).toBeTruthy();
  });
});
