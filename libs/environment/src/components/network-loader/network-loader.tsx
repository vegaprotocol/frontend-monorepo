import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useEnvironment } from '../../hooks';
import { createClient } from '@vegaprotocol/apollo-client';

type NetworkLoaderProps = {
  children?: ReactNode;
  skeleton?: ReactNode;
};

export function NetworkLoader({ skeleton, children }: NetworkLoaderProps) {
  const { VEGA_URL } = useEnvironment();

  const client = useMemo(() => {
    if (VEGA_URL) {
      return createClient(VEGA_URL, {
        typePolicies: {
          Market: {
            merge: true,
          },
          Party: {
            merge: true,
          },
          Query: {},
          Account: {
            keyFields: false,
            fields: {
              balanceFormatted: {},
            },
          },
          Node: {
            keyFields: false,
          },
          Instrument: {
            keyFields: false,
          },
        },
      });
    }
    return undefined;
  }, [VEGA_URL]);

  if (!client) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center">
        {skeleton}
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
