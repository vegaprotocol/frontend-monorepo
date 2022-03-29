import { Splash } from '../splash';
import { ReactNode } from 'react';

interface AsyncRendererProps<T> {
  loading: boolean;
  error: Error | undefined | null;
  data: T | undefined;
  children: (data: T) => ReactNode;
}

// eslint-disable-next-line
export function AsyncRenderer<T = any>({
  loading,
  error,
  data,
  children,
}: AsyncRendererProps<T>) {
  if (error) {
    return <Splash>Something went wrong: {error.message}</Splash>;
  }

  if (loading || !data) {
    return <Splash>Loading...</Splash>;
  }

  return <>{children(data)}</>;
}
