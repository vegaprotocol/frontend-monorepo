import type { Dispatch } from 'react';
import { useState, useEffect, useReducer } from 'react';
import { produce } from 'immer';
import type createClient from '../utils/apollo-client';
import { initializeNode } from '../utils/initialize-node';
import type { NodeData, Configuration } from '../types';
import { CUSTOM_NODE_KEY } from '../types';

type StatisticsPayload = {
  block: NodeData['block']['value'];
  chain: NodeData['chain']['value'];
  responseTime: NodeData['responseTime']['value'];
};

export enum ACTIONS {
  GET_STATISTICS,
  GET_STATISTICS_SUCCESS,
  GET_STATISTICS_FAILURE,
  CHECK_SUBSCRIPTION,
  CHECK_SUBSCRIPTION_SUCCESS,
  CHECK_SUBSCRIPTION_FAILURE,
  UPDATE_BLOCK,
}

type ActionType<T extends ACTIONS, P = undefined> = {
  type: T;
  node: string;
  payload?: P;
};

export type Action =
  | ActionType<ACTIONS.GET_STATISTICS, { url: string }>
  | ActionType<ACTIONS.GET_STATISTICS_SUCCESS, StatisticsPayload>
  | ActionType<ACTIONS.GET_STATISTICS_FAILURE>
  | ActionType<ACTIONS.CHECK_SUBSCRIPTION, { url: string }>
  | ActionType<ACTIONS.CHECK_SUBSCRIPTION_SUCCESS>
  | ActionType<ACTIONS.CHECK_SUBSCRIPTION_FAILURE>
  | ActionType<ACTIONS.UPDATE_BLOCK, number>;

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

const getNodeData = (url?: string): NodeData => ({
  url: url ?? '',
  responseTime: withData(),
  block: withData(),
  ssl: withData(),
  chain: withData(),
});

const getInitialState = (config: Configuration) =>
  config.hosts.reduce<Record<string, NodeData>>(
    (acc, url) => ({
      ...acc,
      [url]: getNodeData(url),
    }),
    {
      [CUSTOM_NODE_KEY]: getNodeData(),
    }
  );

type ClientCollection = Record<
  string,
  undefined | ReturnType<typeof createClient>
>;

type ClientData = {
  clients: ClientCollection;
  subscriptions: ReturnType<typeof initializeNode>['unsubscribe'][];
};

const initializeNodes = (dispatch: Dispatch<Action>, nodes: string[]) => {
  return nodes.reduce<ClientData>(
    (acc, node) => {
      const { client, unsubscribe } = initializeNode(dispatch, node);
      Object.assign(acc.clients, { [node]: client });
      acc.subscriptions.push(unsubscribe);
      return acc;
    },
    {
      clients: {},
      subscriptions: [],
    }
  );
};

const reducer = (state: Record<string, NodeData>, action: Action) => {
  switch (action.type) {
    case ACTIONS.GET_STATISTICS:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].url = action.payload?.url ?? '';
        state[action.node].block.isLoading = true;
        state[action.node].chain.isLoading = true;
        state[action.node].responseTime.isLoading = true;
      });
    case ACTIONS.GET_STATISTICS_SUCCESS:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].block = withData(action.payload?.block);
        state[action.node].chain = withData(action.payload?.chain);
        state[action.node].responseTime = withData(
          action.payload?.responseTime
        );
      });
    case ACTIONS.GET_STATISTICS_FAILURE:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].block = withError();
        state[action.node].chain = withError();
        state[action.node].responseTime = withError();
      });
    case ACTIONS.CHECK_SUBSCRIPTION:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].url = action.payload?.url ?? '';
        state[action.node].ssl.isLoading = true;
      });
    case ACTIONS.CHECK_SUBSCRIPTION_SUCCESS:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].ssl = withData(true);
      });
    case ACTIONS.CHECK_SUBSCRIPTION_FAILURE:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].ssl = withError();
      });
    case ACTIONS.UPDATE_BLOCK:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].block.value = action.payload;
      });
    default:
      return state;
  }
};

export const useNodes = (config: Configuration) => {
  const [clients, setClients] = useState<ClientCollection>({});
  const [customNode, setCustomNode] = useState<undefined | string>();
  const [state, dispatch] = useReducer(reducer, getInitialState(config));

  useEffect(() => {
    const { clients, subscriptions } = initializeNodes(dispatch, config.hosts);
    setClients(clients);

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  // use primitive cache key to prevent infinite rerender loop
  }, [config.hosts.join(';')]);

  useEffect(() => {
    if (customNode) {
      const { client, unsubscribe } = initializeNode(
        dispatch,
        CUSTOM_NODE_KEY,
        customNode
      );
      setClients((clients) => ({
        ...clients,
        [CUSTOM_NODE_KEY]: client,
      }));

      return () => {
        unsubscribe();
      };
    }
    return undefined;
  }, [customNode]);

  return {
    state,
    clients,
    customNode,
    setCustomNode,
    updateNodeBlock: (node: string, value: number) =>
      dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: value, node }),
  };
};
