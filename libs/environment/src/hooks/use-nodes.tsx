import type { Dispatch } from 'react';
import { useState, useEffect, useReducer } from 'react';
import { produce } from 'immer';
import type createClient from '../utils/apollo-client';
import { initializeNode } from '../utils/initialize-node';
import type { NodeData, Configuration } from '../types';

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
  ADD_NODE,
  UPDATE_NODE_URL,
  UPDATE_NODE_BLOCK,
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
  | ActionType<ACTIONS.ADD_NODE>
  | ActionType<ACTIONS.UPDATE_NODE_URL, { url: string }>
  | ActionType<ACTIONS.UPDATE_NODE_BLOCK, number>;

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
  verified: false,
  responseTime: withData(),
  block: withData(),
  ssl: withData(),
  chain: withData(),
});

const getInitialState = (config?: Configuration) =>
  (config?.hosts ?? []).reduce<Record<string, NodeData>>(
    (acc, url) => ({
      ...acc,
      [url]: getNodeData(url),
    }),
    {}
  );

type ClientCollection = Record<
  string,
  undefined | ReturnType<typeof createClient>
>;

type ClientData = {
  clients: ClientCollection;
  subscriptions: ReturnType<typeof initializeNode>['unsubscribe'][];
};

const initializeNodes = (
  dispatch: Dispatch<Action>,
  nodes: Record<string, string>
) => {
  return Object.keys(nodes).reduce<ClientData>(
    (acc, node) => {
      const { client, unsubscribe } = initializeNode(
        dispatch,
        node,
        nodes[node]
      );
      Object.assign(acc.clients, { [nodes[node]]: client });
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
        if (!state[action.node]) {
          state[action.node] = getNodeData(action.payload?.url);
        }
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
        state[action.node].verified =
          state[action.node].ssl.value !== undefined ? true : false;
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
        if (!state[action.node]) {
          state[action.node] = getNodeData(action.payload?.url);
        }
        state[action.node].url = action.payload?.url ?? '';
        state[action.node].ssl.isLoading = true;
      });
    case ACTIONS.CHECK_SUBSCRIPTION_SUCCESS:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].ssl = withData(true);
        state[action.node].verified =
          state[action.node].block.value &&
          state[action.node].chain.value &&
          state[action.node].responseTime.value !== undefined
            ? true
            : false;
      });
    case ACTIONS.CHECK_SUBSCRIPTION_FAILURE:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].ssl = withError();
      });
    case ACTIONS.ADD_NODE:
      return produce(state, (state) => {
        state[action.node] = getNodeData();
      });
    case ACTIONS.UPDATE_NODE_URL:
      return produce(state, (state) => {
        if (!state[action.node]) {
          state[action.node] = getNodeData(action.payload?.url);
        } else {
          state[action.node].url = action.payload?.url ?? '';
        }
      });
    case ACTIONS.UPDATE_NODE_BLOCK:
      return produce(state, (state) => {
        if (!state[action.node]) return;
        state[action.node].block.value = action.payload;
      });
    default:
      return state;
  }
};

export const useNodes = (config?: Configuration) => {
  const [clients, setClients] = useState<ClientCollection>({});
  const [state, dispatch] = useReducer(reducer, getInitialState(config));
  const configCacheKey = config?.hosts.join(';');
  const allUrls = Object.keys(state).map((node) => state[node].url);

  useEffect(() => {
    const nodeUrlMap = (config?.hosts || []).reduce(
      (acc, url) => ({ ...acc, [url]: url }),
      {}
    );
    const { clients: newClients, subscriptions } = initializeNodes(
      dispatch,
      nodeUrlMap
    );
    setClients(newClients);

    return () => {
      Object.keys(clients).forEach((key) => clients[key]?.stop());
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
    // use primitive cache key to prevent infinite rerender loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configCacheKey]);

  useEffect(() => {
    const allNodes = Object.keys(state);
    const initializedUrls = Object.keys(clients);
    const nodeUrlMap = allUrls
      .filter((node) => !initializedUrls.includes(node))
      .reduce<Record<string, string>>((acc, url) => {
        const node = allNodes.find((key) => state[key].url === url);
        if (node) {
          acc[node] = url;
        }
        return acc;
      }, {});

    const { clients: newClients, subscriptions } = initializeNodes(
      dispatch,
      nodeUrlMap
    );
    setClients((prevClients) => ({
      ...prevClients,
      ...newClients,
    }));

    return () => {
      Object.keys(newClients).forEach((key) => newClients[key]?.stop());
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
    // use primitive cache key to prevent infinite rerender loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUrls.join(';')]);

  return {
    state,
    clients,
    addNode: (node: string) => dispatch({ type: ACTIONS.ADD_NODE, node }),
    updateNodeUrl: (node: string, url: string) =>
      dispatch({ type: ACTIONS.UPDATE_NODE_URL, node, payload: { url } }),
    updateNodeBlock: (node: string, value: number) =>
      dispatch({ type: ACTIONS.UPDATE_NODE_BLOCK, node, payload: value }),
  };
};
