import { renderHook } from '@testing-library/react';
import { usePrevious } from './use-previous';

describe('usePrevious', () => {
  it('returns previous value', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => usePrevious(value),
      {
        initialProps: {
          value: 'ABC',
        },
      }
    );
    expect(result.current).toEqual('ABC');
    rerender({ value: 'DEF' });
    expect(result.current).toEqual('ABC');
    rerender({ value: 'GHI' });
    expect(result.current).toEqual('DEF');
    rerender({ value: 'JKL' });
    expect(result.current).toEqual('GHI');
  });
});
