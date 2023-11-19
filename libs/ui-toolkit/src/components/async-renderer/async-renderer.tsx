import { Splash } from '../splash';
import type { ReactNode } from 'react';
import { Button } from '../button';
import { useT } from '../../use-t';

interface AsyncRendererProps<T> {
  loading: boolean;
  loadingMessage?: string;
  error: Error | undefined | null;
  errorMessage?: string;
  data: T | undefined;
  noDataMessage?: string;
  children?: ReactNode | null;
  render?: (data: T) => ReactNode;
  noDataCondition?(data?: T): boolean;
  reload?: () => void;
}

export function AsyncRenderer<T = object>({
  loading,
  loadingMessage,
  error,
  errorMessage,
  data,
  noDataMessage,
  noDataCondition,
  children,
  render,
  reload,
}: AsyncRendererProps<T>) {
  const t = useT();
  if (error) {
    if (!data || (Array.isArray(data) && !data.length)) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex h-12 flex-col  items-center">
            <Splash>
              {errorMessage
                ? errorMessage
                : t('Something went wrong: {{errorMessage}}', {
                    errorMessage: error.message,
                  })}
            </Splash>
            {reload && error.message === 'Timeout exceeded' && (
              <Button
                size="sm"
                className="pointer-events-auto"
                type="button"
                onClick={reload}
              >
                {t('Try again')}
              </Button>
            )}
          </div>
        </div>
      );
    }
  }

  if (loading) {
    return <Splash>{loadingMessage ? loadingMessage : t('Loading...')}</Splash>;
  }

  if (noDataCondition ? noDataCondition(data) : !data) {
    return <Splash>{noDataMessage ? noDataMessage : t('No data')}</Splash>;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{render ? render(data as T) : children}</>;
}

export function AsyncRendererInline<T>({
  loading,
  loadingMessage,
  error,
  errorMessage,
  data,
  noDataMessage,
  noDataCondition,
  children,
  render,
  reload,
}: AsyncRendererProps<T>) {
  const t = useT();
  const wrapperClasses = 'text-sm';
  if (error) {
    if (!data) {
      return (
        <div className={wrapperClasses}>
          <p>
            {errorMessage
              ? errorMessage
              : t('Something went wrong: {{errorMessage}}', {
                  errorMessage: error.message,
                })}
          </p>
          {reload && error.message === 'Timeout exceeded' && (
            <Button
              size="sm"
              className="pointer-events-auto"
              type="button"
              onClick={reload}
            >
              {t('Try again')}
            </Button>
          )}
        </div>
      );
    }
  }

  if (loading) {
    return (
      <p className={wrapperClasses}>
        {loadingMessage ? loadingMessage : t('Loading...')}
      </p>
    );
  }

  if (noDataCondition ? noDataCondition(data) : !data) {
    return (
      <p className={wrapperClasses}>
        {noDataMessage ? noDataMessage : t('No data')}
      </p>
    );
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{render ? render(data as T) : children}</>;
}
