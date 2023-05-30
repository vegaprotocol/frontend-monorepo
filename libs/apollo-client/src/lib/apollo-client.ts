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
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useHeaderStore } from './header-store';

const isBrowser = typeof window !== 'undefined';

const NOT_FOUND = 'NotFound';

export type ClientOptions = {
  url?: string;
  cacheConfig?: InMemoryCacheConfig;
  retry?: boolean;
  connectToDevTools?: boolean;
  connectToHeaderStore?: boolean;
};

export function createClient({
  url,
  cacheConfig,
  retry = true,
  connectToDevTools = true,
  connectToHeaderStore = true,
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

  const headerLink = connectToHeaderStore
    ? new ApolloLink((operation, forward) => {
        return forward(operation).map((response) => {
          const context = operation.getContext();
          const r = context['response'];
          const blockHeight = r?.headers.get('x-block-height');
          const timestamp = r?.headers.get('x-block-timestamp');
          if (blockHeight && timestamp) {
            const state = useHeaderStore.getState();
            const urlState = state[r.url];
            if (
              !urlState?.blockHeight ||
              urlState.blockHeight !== blockHeight
            ) {
              useHeaderStore.setState({
                ...state,
                [r.url]: {
                  blockHeight: Number(blockHeight),
                  timestamp: new Date(Number(timestamp.slice(0, -6))),
                },
              });
            }
          }
          return response;
        });
      })
    : noOpLink;

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

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    // if any of these queries error don't capture any errors, its
    // likely the user is connecting to a dodgy node, NodeGuard gets
    // called on startup, NodeCheck and NodeCheckTimeUpdate are called
    // by the NodeSwitcher component and the useNodeHealth hook
    if (
      ['NodeGuard', 'NodeCheck', 'NodeCheckTimeUpdate'].includes(
        operation.operationName
      )
    ) {
      return;
    }

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
    link: from([
      errorLink,
      composedTimeoutLink,
      retryLink,
      headerLink,
      splitLink,
    ]),
    cache: new InMemoryCache(cacheConfig),
    connectToDevTools,
  });
}
