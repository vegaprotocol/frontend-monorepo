import { render } from '@testing-library/react';

import BrowserWallet from './browser-wallet';

describe('BrowserWallet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserWallet />);
    expect(baseElement).toBeTruthy();
  });
});
