import { renderHook, waitFor } from '@testing-library/react';
import { useScript } from './trading-view';

import '@testing-library/jest-dom';

describe('TradingView', () => {
  it.todo('should render successfully');
});

describe('useScript', () => {
  it('appends a script to the body', async () => {
    const url = 'http://localhost:8080/foo.js';

    const { result } = renderHook(() => useScript(url));

    expect(result.current).toBe(false);

    await waitFor(() => {
      const script = document.body.getElementsByTagName('script')[0];
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('src', url);
    });
  });
});
