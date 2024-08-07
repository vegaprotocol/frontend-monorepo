import type { ComponentType } from 'react';

import { useErrorStore } from '@/stores/error';

export interface ErrorProperties {
  error: Error | null;
  setError: (error: Error | null) => void;
}

export function withErrorStore<P extends ErrorProperties>(
  Component: ComponentType<P>
) {
  const Wrapper = (properties: Omit<P, keyof ErrorProperties>) => {
    const errorProperties = useErrorStore((state) => ({
      setError: state.setError,
      error: state.error,
    }));

    return <Component {...errorProperties} {...(properties as P)} />;
  };

  return Wrapper;
}
