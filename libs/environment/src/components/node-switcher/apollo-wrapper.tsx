import { ApolloProvider } from '@apollo/client';
import { createClient } from '@vegaprotocol/apollo-client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export const ApolloWrapper = ({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) => {
  const client = useMemo(
    () =>
      createClient({
        url,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
        connectToHeaderStore: true,
      }),
    [url]
  );
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
