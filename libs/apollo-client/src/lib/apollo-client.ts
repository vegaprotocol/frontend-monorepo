import type { InMemoryCacheConfig } from '@apollo/client';
import {
  ApolloClient,
  from,
  split,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWSClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import ApolloLinkTimeout from 'apollo-link-timeout';

const isBrowser = typeof window !== 'undefined';

export function createClient(base?: string, cacheConfig?: InMemoryCacheConfig) {
  if (!base) {
    throw new Error('Base must be passed into createClient!');
  }
  const urlHTTP = new URL(base);
  const urlWS = new URL(base);
  // Replace http with ws, preserving if its a secure connection eg. https => wss
  urlWS.protocol = urlWS.protocol.replace('http', 'ws');
  const timeoutLink = new ApolloLinkTimeout(10000);
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 10000,
      jitter: true,
    },
  });

  const httpLink = new HttpLink({
    uri: urlHTTP.href,
    credentials: 'same-origin',
  });

  const wsLink = isBrowser
    ? new GraphQLWsLink(
        createWSClient({
          url: urlWS.href,
        })
      )
    : new ApolloLink((operation, forward) => forward(operation));

  const splitLink = isBrowser
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) console.log(graphQLErrors);
    if (networkError) console.log(networkError);
  });

  return new ApolloClient({
    link: from([errorLink, timeoutLink, retryLink, splitLink]),
    cache: new InMemoryCache(cacheConfig),
  });
}
