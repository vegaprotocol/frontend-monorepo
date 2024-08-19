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
  const { status, API_NODE } = useEnvironment((store) => ({
    status: store.status,
    API_NODE: store.API_NODE,
  }));

  const client = useMemo(() => {
    if (status === 'success' && API_NODE) {
      return createClient({
        url: API_NODE.graphQLApiUrl,
        cacheConfig: cache,
      });
    }
    return undefined;
  }, [status, API_NODE, cache]);

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
