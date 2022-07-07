import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';

type NetworkLoaderProps<T> = {
  children?: ReactNode;
  skeleton?: ReactNode;
  createClient: (url: string) => ApolloClient<T>;
};

export function NetworkLoader<T>({
  skeleton,
  children,
  createClient,
}: NetworkLoaderProps<T>) {
  const { VEGA_URL } = useEnvironment();

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient(VEGA_URL);
    }
    return undefined;
  }, [VEGA_URL, createClient]);

  if (!client) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        {skeleton}
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
