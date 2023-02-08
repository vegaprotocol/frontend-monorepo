import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { InMemoryCacheConfig } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { createClient } from '@vegaprotocol/apollo-client';
import { t } from '@vegaprotocol/react-helpers';

type NetworkLoaderProps = {
  children?: ReactNode;
  skeleton?: ReactNode;
  failure?: ReactNode;
  cache?: InMemoryCacheConfig;
};

export function NetworkLoader({
  skeleton,
  failure,
  children,
  cache,
}: NetworkLoaderProps) {
  const { status, VEGA_URL } = useEnvironment((store) => ({
    status: store.status,
    error: store.error,
    VEGA_URL: store.VEGA_URL,
  }));

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient({
        url: VEGA_URL,
        cacheConfig: cache,
      });
    }
    return undefined;
  }, [VEGA_URL, cache]);

  const nonIdealWrapperClasses =
    'h-full min-h-screen flex items-center justify-center';

  if (status === 'failed') {
    return <div className={nonIdealWrapperClasses}>{failure}</div>;
  }

  if (status === 'default' || status === 'pending' || !client) {
    return <div className={nonIdealWrapperClasses}>{skeleton}</div>;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
