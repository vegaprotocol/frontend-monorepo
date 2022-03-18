import {
  ApolloClient,
  split,
  from,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createClient as createWSClient } from 'graphql-ws';

export function createClient(base?: string) {
  if (!base) {
    throw new Error('Base must be passed into createClient!');
  }
  const gqlPath = 'query';
  const urlHTTP = new URL(gqlPath, base);
  const urlWS = new URL(gqlPath, base);
  // Replace http with ws, preserving if its a secure connection eg. https => wss
  urlWS.protocol = urlWS.protocol.replace('http', 'ws');

  const cache = new InMemoryCache({
    typePolicies: {
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
    },
  });

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

  const wsLink = process.browser
    ? new GraphQLWsLink(
        createWSClient({
          url: urlWS.href,
        })
      )
    : null;

  const splitLink = process.browser
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
    console.log(graphQLErrors);
    console.log(networkError);
  });

  return new ApolloClient({
    connectToDevTools: process.env['NODE_ENV'] === 'development',
    link: from([errorLink, retryLink, splitLink]),
    cache,
  });
}
