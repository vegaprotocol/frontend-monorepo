import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo } from 'react';
import { localLoggerFactory } from '@vegaprotocol/utils';

type ResizeObserverConfiguration = {
  debounceTime: number;
  config: ResizeObserverOptions;
};

const DEFAULT_OPTIONS: ResizeObserverConfiguration = {
  debounceTime: 0,
  config: {
    box: 'border-box',
  },
};

export function useResizeObserver(
  target: Element | null,
  callback: ResizeObserverCallback,
  options: ResizeObserverConfiguration = DEFAULT_OPTIONS
) {
  const cb = useCallback(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) =>
      window.requestAnimationFrame(() => {
        options.debounceTime > 0
          ? debounce(callback, options.debounceTime)(entries, observer)
          : callback(entries, observer);
      }),
    [callback, options.debounceTime]
  );

  const observer = useMemo(() => {
    return new ResizeObserver(cb);
  }, [cb]);

  useEffect(() => {
    if (!observer || !target) return;
    try {
      observer.observe(target, options.config);
    } catch (err) {
      localLoggerFactory({ application: 'react-helpers' }).debug(err as Error);
    }
    return () => observer?.disconnect();
  }, [observer, options.config, target]);
}
