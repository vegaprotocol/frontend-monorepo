import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { InMemoryCacheConfig } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment, useOfflineListener } from '../../hooks';
import { t } from '@vegaprotocol/react-helpers';
import { createClient } from '@vegaprotocol/apollo-client';
import { MaintenancePage } from '@vegaprotocol/ui-toolkit';

type NetworkLoaderProps = {
  children?: ReactNode;
  skeleton?: ReactNode;
  cache?: InMemoryCacheConfig;
};

export function NetworkLoader({
  skeleton,
  children,
  cache,
}: NetworkLoaderProps) {
  const { VEGA_URL } = useEnvironment();
  const isOffline = useOfflineListener();
  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient({
        url: VEGA_URL,
        cacheConfig: cache,
      });
    }
    return undefined;
  }, [VEGA_URL, cache]);

  if (isOffline) {
    children = (
      <div className="h-full w-full">
        <div className="h-full w-full absolute top-0 left-0 right-0 bottom-0 z-50">
          <div className="h-full min-h-screen flex items-center justify-center">
            <div>
              <h2>{t('Oops something went wrong :-(')}</h2>
              {t('Check your network connection')}
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        {skeleton}
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
