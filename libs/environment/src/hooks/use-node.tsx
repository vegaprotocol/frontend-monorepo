import { useEffect, useReducer } from 'react';
import { produce } from 'immer';
import { gql } from '@apollo/client';
import type { createClient } from '../utils/apollo-client';
import type { NodeData } from '../types';
import type { Statistics } from './__generated__/Statistics';

type StatisticsPayload = {
  block: NodeData['block']['value'];
  chain: NodeData['chain']['value'];
  responseTime: NodeData['responseTime']['value'];
};

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

enum ACTION {
  GET_STATISTICS,
  GET_STATISTICS_SUCCESS,
  GET_STATISTICS_FAILURE,
  CHECK_SUBSCRIPTION,
  CHECK_SUBSCRIPTION_SUCCESS,
  CHECK_SUBSCRIPTION_FAILURE,
  UPDATE_BLOCK,
  RESET_STATE,
}

function withData<T>(value?: T) {
  return {
    isLoading: false,
    hasError: false,
    value,
  };
}

function withError<T>(value?: T) {
  return {
    isLoading: false,
    hasError: true,
    value,
  };
}

const getInitialState = (url?: string): NodeData => ({
  url: url ?? '',
  responseTime: withData(),
  block: withData(),
  ssl: withData(),
  chain: withData(),
});

const getResponseTime = (url: string) => {
  const requests = window.performance.getEntriesByName(url);
  const { duration } = (requests.length && requests[requests.length - 1]) || {};
  return duration;
};

type ActionType<T extends ACTION, P = undefined> = {
  type: T;
  payload?: P;
};

type Action =
  | ActionType<ACTION.GET_STATISTICS>
  | ActionType<ACTION.GET_STATISTICS_SUCCESS, StatisticsPayload>
  | ActionType<ACTION.GET_STATISTICS_FAILURE>
  | ActionType<ACTION.CHECK_SUBSCRIPTION>
  | ActionType<ACTION.CHECK_SUBSCRIPTION_SUCCESS>
  | ActionType<ACTION.CHECK_SUBSCRIPTION_FAILURE>
  | ActionType<ACTION.UPDATE_BLOCK, number>
  | ActionType<ACTION.RESET_STATE>;

const reducer = (state: NodeData, action: Action) => {
  switch (action.type) {
    case ACTION.GET_STATISTICS:
      return produce(state, (state) => {
        state.block.isLoading = true;
        state.chain.isLoading = true;
        state.responseTime.isLoading = true;
      });
    case ACTION.GET_STATISTICS_SUCCESS:
      return produce(state, (state) => {
        state.block = withData(action.payload?.block);
        state.chain = withData(action.payload?.chain);
        state.responseTime = withData(action.payload?.responseTime);
      });
    case ACTION.GET_STATISTICS_FAILURE:
      return produce(state, (state) => {
        state.block = withError();
        state.chain = withError();
        state.responseTime = withError();
      });
    case ACTION.CHECK_SUBSCRIPTION:
      return produce(state, (state) => {
        state.ssl.isLoading = true;
      });
    case ACTION.CHECK_SUBSCRIPTION_SUCCESS:
      return produce(state, (state) => {
        state.ssl = withData(true);
      });
    case ACTION.CHECK_SUBSCRIPTION_FAILURE:
      return produce(state, (state) => {
        state.ssl = withError();
      });
    case ACTION.UPDATE_BLOCK:
      return produce(state, (state) => {
        state.block.value = action.payload;
      });
    case ACTION.RESET_STATE:
      return produce(state, (state) => {
        state.responseTime = withData();
        state.block = withData();
        state.ssl = withData();
        state.chain = withData();
      });
    default:
      return state;
  }
};

export const useNode = (
  url?: string,
  client?: ReturnType<typeof createClient>
) => {
  const [state, dispatch] = useReducer(reducer, getInitialState(url));

  useEffect(() => {
    if (client && url) {
      dispatch({ type: ACTION.GET_STATISTICS });
      dispatch({ type: ACTION.CHECK_SUBSCRIPTION });

      client
        .query<Statistics>({
          query: STATS_QUERY,
        })
        .then((res) => {
          dispatch({
            type: ACTION.GET_STATISTICS_SUCCESS,
            payload: {
              chain: res.data.statistics.chainId,
              block: Number(res.data.statistics.blockHeight),
              responseTime: getResponseTime(url),
            },
          });
        })
        .catch(() => {
          dispatch({ type: ACTION.GET_STATISTICS_FAILURE });
        });

      const subscription = client
        .subscribe({
          query: TIME_UPDATE_SUBSCRIPTION,
          errorPolicy: 'all',
        })
        .subscribe({
          next() {
            dispatch({ type: ACTION.CHECK_SUBSCRIPTION_SUCCESS });
            subscription.unsubscribe();
          },
          error() {
            dispatch({ type: ACTION.CHECK_SUBSCRIPTION_FAILURE });
            subscription.unsubscribe();
          },
        });
    }
  }, [client, url, dispatch]);

  return {
    state,
    updateBlockState: (value: number) =>
      dispatch({ type: ACTION.UPDATE_BLOCK, payload: value }),
    reset: () => dispatch({ type: ACTION.RESET_STATE }),
  };
};
