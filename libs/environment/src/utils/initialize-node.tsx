import type { Dispatch } from 'react';
import { ACTIONS } from '../hooks/use-nodes';
import type { Action } from '../hooks/use-nodes';
import { requestNode } from './request-node';
import { GQL_PATH } from './apollo-client';

const getResponseTime = (url: string) => {
  const requestUrl = new URL(GQL_PATH, url);
  const requests = window.performance.getEntriesByName(requestUrl.href);
  const { duration } = (requests.length && requests[requests.length - 1]) || {};
  return duration;
};

export const initializeNode = (
  dispatch: Dispatch<Action>,
  node: string,
  nodeUrl?: string
) => {
  let isMounted = true;
  const url = nodeUrl ?? node;

  dispatch({ type: ACTIONS.GET_STATISTICS, node, payload: { url } });
  dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION, node, payload: { url } });

  const client = requestNode(url, {
    onStatsSuccess: (data) => {
      isMounted &&
        dispatch({
          type: ACTIONS.GET_STATISTICS_SUCCESS,
          node,
          payload: {
            chain: data.statistics.chainId,
            block: Number(data.statistics.blockHeight),
            responseTime: getResponseTime(url),
          },
        });
    },
    onStatsFailure: () => {
      isMounted && dispatch({ type: ACTIONS.GET_STATISTICS_FAILURE, node });
    },
    onSubscriptionSuccess: () => {
      isMounted && dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION_SUCCESS, node });
    },
    onSubscriptionFailure: () => {
      isMounted && dispatch({ type: ACTIONS.CHECK_SUBSCRIPTION_FAILURE, node });
    },
  });

  return {
    client,
    unsubscribe: () => {
      client?.stop();
      isMounted = false;
    },
  };
};
