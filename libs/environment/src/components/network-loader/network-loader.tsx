import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { InMemoryCacheConfig } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { createClient } from '@vegaprotocol/apollo-client';

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

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient({
        url: VEGA_URL,
        cacheConfig: cache,
      });
    }
    return undefined;
  }, [VEGA_URL, cache]);

  if (!client) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        {skeleton}
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
