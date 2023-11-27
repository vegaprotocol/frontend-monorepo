import { renderHook, waitFor } from '@testing-library/react';
import { useScript } from './use-script';

describe('useScript', () => {
  it('appends a script to the body', async () => {
    const url = 'http://localhost:8080/foo.js';

    const { result } = renderHook(() => useScript(url));

    expect(result.current).toBe('pending');

    await waitFor(() => {
      const script = document.body.getElementsByTagName('script')[0];
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('src', url);
    });
  });
});
