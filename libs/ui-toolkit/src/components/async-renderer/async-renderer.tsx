import { Splash } from '../splash';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Button } from '../button';

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
  if (error) {
    if (!data) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="h-12 flex flex-col  items-center">
            <Splash>
              {errorMessage
                ? errorMessage
                : t(`Something went wrong: ${error.message}`)}
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
