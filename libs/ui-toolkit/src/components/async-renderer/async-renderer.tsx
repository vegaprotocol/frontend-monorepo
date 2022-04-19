import { Splash } from '../splash';
import type { ReactElement, ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';

interface AsyncRendererProps<T> {
  loading: boolean;
  error: Error | undefined | null;
  data: T | undefined;
  children?: ReactElement | null;
  render?: (data: T) => ReactNode;
}

export function AsyncRenderer<T = object>({
  loading,
  error,
  data,
  children,
  render,
}: AsyncRendererProps<T>) {
  if (error) {
    return <Splash>{t(`Something went wrong: ${error.message}`)}</Splash>;
  }

  if (loading) {
    return <Splash>{t('Loading...')}</Splash>;
  }

  if (!data) {
    return <Splash>{t('No data')}</Splash>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{render ? render(data) : children}</>;
}
