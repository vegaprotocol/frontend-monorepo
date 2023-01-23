import type { ApolloError, InMemoryCacheConfig } from '@apollo/client';
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
import type { GraphQLErrors } from '@apollo/client/errors';
import { localLoggerFactory } from '@vegaprotocol/react-helpers';

const isBrowser = typeof window !== 'undefined';

const NOT_FOUND = 'NotFound';

type ClientOptions = {
  url?: string;
  cacheConfig?: InMemoryCacheConfig;
  retry?: boolean;
  connectToDevTools?: boolean;
};

export function createClient({
  url,
  cacheConfig,
  retry = true,
  connectToDevTools = true,
}: ClientOptions) {
  if (!url) {
    throw new Error('url must be passed into createClient!');
  }
  const urlHTTP = new URL(url);
  const urlWS = new URL(url);
  // Replace http with ws, preserving if its a secure connection eg. https => wss
  urlWS.protocol = urlWS.protocol.replace('http', 'ws');

  const noOpLink = new ApolloLink((operation, forward) => {
    return forward(operation);
  });

  const timeoutLink = new ApolloLinkTimeout(10000);
  const enlargedTimeoutLink = new ApolloLinkTimeout(100000);

  const retryLink = retry
    ? new RetryLink({
        delay: {
          initial: 300,
          max: 10000,
          jitter: true,
        },
      })
    : noOpLink;

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
    : noOpLink;

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
    if (graphQLErrors) {
      graphQLErrors.forEach((e) => {
        if (e.extensions && e.extensions['type'] !== NOT_FOUND) {
          localLoggerFactory({ application: 'apollo-client' }).error(e);
        }
      });
    }
    if (networkError) {
      localLoggerFactory({ application: 'apollo-client' }).error(networkError);
    }
  });

  const composedTimeoutLink = split(
    ({ getContext }) => Boolean(getContext()['isEnlargedTimeout']),
    enlargedTimeoutLink,
    timeoutLink
  );

  return new ApolloClient({
    link: from([errorLink, composedTimeoutLink, retryLink, splitLink]),
    cache: new InMemoryCache(cacheConfig),
    connectToDevTools,
  });
}

const isApolloGraphQLError = (
  error: ApolloError | Error | undefined
): error is ApolloError => {
  return !!error && !!(error as ApolloError).graphQLErrors;
};

const hasNotFoundGraphQLErrors = (errors: GraphQLErrors) => {
  return errors.some((e) => e.extensions && e.extensions['type'] === NOT_FOUND);
};

export const isNotFoundGraphQLError = (
  error: Error | ApolloError | undefined
) => {
  return (
    isApolloGraphQLError(error) && hasNotFoundGraphQLErrors(error.graphQLErrors)
  );
};
