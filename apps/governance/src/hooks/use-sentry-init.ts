import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { TELEMETRY_ON } from '../components/telemetry-dialog/telemetry-dialog';
import { useEnvironment } from '@vegaprotocol/environment';
import { ENV } from '../config';
import { isPartyNotFoundError } from '../lib/party';

export const useSentryInit = () => {
  const { VEGA_ENV, GIT_COMMIT_HASH, GIT_BRANCH } = useEnvironment();
  const [telemetryOn] = useLocalStorage(TELEMETRY_ON);

  useEffect(() => {
    if (ENV.dsn && telemetryOn === 'true') {
      Sentry.init({
        dsn: ENV.dsn,
        tracesSampleRate: 0.1,
        enabled: true,
        environment: VEGA_ENV,
        release: GIT_COMMIT_HASH,
        beforeSend(event, hint) {
          const error = hint?.originalException;
          const errorIsString = typeof error === 'string';
          const errorIsObject = error instanceof Error;
          const requestUrl = event.request?.url;
          const transaction = event.transaction;

          if (
            (errorIsString && isPartyNotFoundError({ message: error })) ||
            (errorIsObject && isPartyNotFoundError(error))
          ) {
            // This error is caused by a pubkey making an API request before
            // it has interacted with the chain. This isn't needed in Sentry.
            return null;
          }

          const updatedRequest =
            requestUrl && requestUrl.includes('/claim?')
              ? { ...event.request, url: removeQueryParams(requestUrl) }
              : event.request;

          const updatedTransaction =
            transaction && transaction.includes('/claim?')
              ? removeQueryParams(transaction)
              : transaction;

          const updatedBreadcrumbs = event.breadcrumbs?.map((breadcrumb) => {
            if (
              breadcrumb.type === 'navigation' &&
              breadcrumb.data?.to?.includes('/claim?')
            ) {
              return {
                ...breadcrumb,
                data: {
                  ...breadcrumb.data,
                  to: removeQueryParams(breadcrumb.data.to),
                },
              };
            }
            return breadcrumb;
          });

          return {
            ...event,
            request: updatedRequest,
            transaction: updatedTransaction,
            breadcrumbs: updatedBreadcrumbs ?? event.breadcrumbs,
          };
        },
      });
      Sentry.setTag('branch', GIT_BRANCH);
      Sentry.setTag('commit', GIT_COMMIT_HASH);
    } else {
      Sentry.close();
    }
  }, [GIT_COMMIT_HASH, GIT_BRANCH, VEGA_ENV, telemetryOn]);
};

const removeQueryParams = (url: string) => {
  return url.split('?')[0];
};
