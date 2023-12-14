import { renderHook, waitFor } from '@testing-library/react';
import { useScript } from './use-script';

describe('useScript', () => {
  it('appends a script to the body', async () => {
    const url = 'http://localhost:8080/foo.js';

    const { result } = renderHook(() => useScript(url, 'integrity-hash'));

    expect(result.current).toBe('loading');

    await waitFor(() => {
      const script = document.body.getElementsByTagName('script')[0];
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('src', url);
    });
  });
});
