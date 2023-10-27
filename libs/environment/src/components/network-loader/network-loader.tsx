import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { InMemoryCacheConfig } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { createClient } from '@vegaprotocol/apollo-client';

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
    VEGA_URL: store.VEGA_URL,
  }));

  const client = useMemo(() => {
    if (status === 'success' && VEGA_URL) {
      return createClient({
        url: VEGA_URL,
        cacheConfig: cache,
      });
    }
    return undefined;
  }, [VEGA_URL, status, cache]);

  if (status === 'failed') {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  if (status === 'default' || status === 'pending' || !client) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{skeleton}</>;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
