import { Splash } from '../splash';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';

interface AsyncRendererProps<T> {
  loading: boolean;
  loadingMessage?: string;
  error: Error | undefined | null;
  errorMessage?: string;
  data: T | undefined;
  noDataMessage?: string;
  children?: ReactNode | null;
  render?: (data: T) => ReactNode;
}

export function AsyncRenderer<T = object>({
  loading,
  loadingMessage,
  error,
  errorMessage,
  data,
  noDataMessage,
  children,
  render,
}: AsyncRendererProps<T>) {
  if (error) {
    return (
      <Splash>
        {errorMessage
          ? errorMessage
          : t(`Something went wrong: ${error.message}`)}
      </Splash>
    );
  }

  if (loading) {
    return <Splash>{loadingMessage ? loadingMessage : t('Loading...')}</Splash>;
  }

  if (!data) {
    return <Splash>{noDataMessage ? noDataMessage : t('No data')}</Splash>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{render ? render(data) : children}</>;
}
