import { captureException } from '@sentry/react';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';

type MutationObserverConfiguration = {
  debounceTime: number;
  config: MutationObserverInit;
};

const DEFAULT_OPTIONS: MutationObserverConfiguration = {
  debounceTime: 1000 / 16,
  config: {
    attributes: true,
    childList: false,
    subtree: false,
  },
};

export function useMutationObserver(
  target: Node | null,
  callback: MutationCallback,
  options: MutationObserverConfiguration = DEFAULT_OPTIONS
) {
  const [observer, setObserver] = useState<MutationObserver | null>(null);

  useEffect(() => {
    setObserver(
      new MutationObserver(
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
