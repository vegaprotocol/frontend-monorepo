import { CenteredLayout } from '@/layouts/centered';
import { useSuspenseAssets } from '@/lib/hooks/use-assets';
import { useSuspenseMarkets } from '@/lib/hooks/use-markets';
import { useSuspenseMarketsData } from '@/lib/hooks/use-markets-data';
import { t } from '@/lib/utils';
import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ErrorBoundary } from './error-boundary';

/**
 * Handles any queries required for the app to function. Will prevent rendering
 * until those queries resolve, if they fail a fallback UI is rendered and no
 * functionality will be present
 */
export const Bootstrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <DataFetcher />
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Suspense queries for the entire app, the order here is important because these
 * will be queued in the order they are called, assets comes first because
 * markets requires asset data
 */
const DataFetcher = () => {
  useSuspenseAssets();
  useSuspenseMarkets();
  useSuspenseMarketsData();
  return null;
};

/**
 * Renders failure ui if the app cannot run
 */
const ErrorFallback = () => {
  return (
    <CenteredLayout className="mt-10">
      <Alert variant="destructive">
        <AlertTitle>{t('BOOT_FAILED_TITLE')}</AlertTitle>
        <AlertDescription>{t('BOOT_FAILED_DESCRIPTION')}</AlertDescription>
      </Alert>
    </CenteredLayout>
  );
};

/**
 * Renders loading state but only after at least 400ms
 * have passed. This prevents a flickering up of the
 * initial loading screen
 */
const LoadingFallback = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!show) return null;

  return (
    <CenteredLayout className="mt-10">
      <Alert variant="default">
        <AlertTitle>{t('BOOT_LOADING_TITLE')}</AlertTitle>
        <AlertDescription>{t('BOOT_LOADING_DESCRIPTION')}</AlertDescription>
      </Alert>
    </CenteredLayout>
  );
};
