import { captureException } from '@sentry/react';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';

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
  const [observer, setObserver] = useState<ResizeObserver | null>(null);

  useEffect(() => {
    setObserver(
      new ResizeObserver(
        options.debounceTime > 0
          ? debounce(callback, options.debounceTime)
          : callback
      )
    );
  }, [callback, options.debounceTime, setObserver]);

  useEffect(() => {
    if (!observer || !target) return;
    try {
      observer.observe(target, options.config);
    } catch (err) {
      captureException(err);
    }
    return () => observer?.disconnect();
  }, [observer, options.config, target]);
}
