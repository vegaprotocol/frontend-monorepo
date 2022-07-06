import type { Dispatch } from 'react';
import { gql } from '@apollo/client';
import createClient from './apollo-client';
import { ACTIONS } from '../hooks/use-nodes';
import type { Action } from '../hooks/use-nodes';
import type { Statistics } from './__generated__/Statistics';

export const STATS_QUERY = gql`
  query Statistics {
    statistics {
      chainId
      blockHeight
    }
  }
`;

export const TIME_UPDATE_SUBSCRIPTION = gql`
  subscription BlockTime {
    busEvents(types: TimeUpdate, batchSize: 1) {
      eventId
    }
  }
`;

const getResponseTime = (url: string) => {
  const requests = window.performance.getEntriesByName(url);
  const { duration } = (requests.length && requests[requests.length - 1]) || {};
  return duration;
};

export const initializeNode = (
  dispatch: Dispatch<Action>,
  node: string,
  nodeUrl?: string
) => {
  const url = nodeUrl ?? node;

  dispatch({ type: ACTIONS.GET_STATISTICS, node, payload: { url } });
  dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION, node, payload: { url } });

  try {
    new URL(url);
  } catch (err) {
    dispatch({ type: ACTIONS.GET_STATISTICS_FAILURE, node });
    dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION_FAILURE, node });
    return {
      client: undefined,
      unsubscribe: () => {
        isMounted = false;
      },
    };
  }

  const client = createClient(url);
  let isMounted = true;

  client
    .query<Statistics>({
      query: STATS_QUERY,
    })
    .then((res) => {
      isMounted &&
        dispatch({
          type: ACTIONS.GET_STATISTICS_SUCCESS,
          node,
          payload: {
            chain: res.data.statistics.chainId,
            block: Number(res.data.statistics.blockHeight),
            responseTime: getResponseTime(url),
          },
        });
    })
    .catch(() => {
      isMounted && dispatch({ type: ACTIONS.GET_STATISTICS_FAILURE, node });
    });

  const subscription = client
    .subscribe({
      query: TIME_UPDATE_SUBSCRIPTION,
      errorPolicy: 'all',
    })
    .subscribe({
      next() {
        isMounted &&
          dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION_SUCCESS, node });
        subscription.unsubscribe();
      },
      error() {
        isMounted &&
          dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION_FAILURE, node });
        subscription.unsubscribe();
      },
    });

  return {
    client,
    unsubscribe: () => {
      client.stop();
      isMounted = false;
    },
  };
};
