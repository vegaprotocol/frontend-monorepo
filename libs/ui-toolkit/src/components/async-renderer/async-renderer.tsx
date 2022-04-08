import { Splash } from '../splash';
import type { ReactElement } from 'react';

interface AsyncRendererProps<T> {
  loading: boolean;
  error: Error | undefined | null;
  data: T | undefined;
  children?: ReactElement;
}

export function AsyncRenderer<T = object>({
  loading,
  error,
  data,
  children,
}: AsyncRendererProps<T>) {
  if (error) {
    return <Splash>Something went wrong: {error.message}</Splash>;
  }

  if (loading) {
    return <Splash>Loading...</Splash>;
  }

  if (!data || !children) {
    return <Splash>No data</Splash>;
  }

  return children;
}
