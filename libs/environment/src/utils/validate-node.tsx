import { t } from '@vegaprotocol/react-helpers';
import { CUSTOM_NODE_KEY, ErrorType } from '../types';
import type { Networks, NodeData } from '../types';

export const getIsNodeLoading = ({
  chain,
  responseTime,
  block,
  ssl,
}: NodeData) => {
  return (
    chain.isLoading ||
    responseTime.isLoading ||
    block.isLoading ||
    ssl.isLoading
  );
};

export const getHasInvalidChain = (env: Networks, chain?: string) => {
  return !(chain?.includes(env.toLowerCase()) ?? false);
};

const getHasInvalidUrl = (url: string) => {
  try {
    new URL(url);
    return false;
  } catch (err) {
    return true;
  }
};

export const getIsNodeDisabled = (env: Networks, data: NodeData) => {
  return (
    getIsNodeLoading(data) ||
    getHasInvalidChain(env, data.chain.value) ||
    getHasInvalidUrl(data.url) ||
    data.chain.hasError ||
    data.responseTime.hasError ||
    data.block.hasError ||
    data.ssl.hasError
  );
};

export const getIsFormDisabled = (
  currentNode: string | undefined,
  inputText: string,
  env: Networks,
  state: Record<string, NodeData>
) => {
  if (!currentNode) {
    return true;
  }

  if (
    currentNode === CUSTOM_NODE_KEY &&
    inputText !== state[CUSTOM_NODE_KEY].url
  ) {
    return true;
  }

  const data = state[currentNode];
  return getIsNodeDisabled(env, data);
};

export const getErrorByType = (errorType: ErrorType | undefined, env: Networks, url?: string) => {
  switch (errorType) {
    case ErrorType.INVALID_URL: return {
      headline: t('Error: invalid url'),
      message: t(url ? `${url} is not a valid url.` : ''),
    }
    case ErrorType.INVALID_NETWORK: return {
      headline: t(`Error: incorrect network`),
      message: t(`This node is not on the ${env} network.`),
    }
    case ErrorType.SSL_ERROR: return {
      headline: t(`Error: the node you are reading from does not have SSL`),
      message: t(
        '${data.url} does not have SSL. SSL is required to subscribe to data.'
      ),
    }
    case ErrorType.CONNECTION_ERROR: return {
      headline: t(`Error: can't connect to node`),
      message: t(url ? `There was an error connecting to ${url}.` : ''),
    }
    case ErrorType.CONNECTION_ERROR_ALL: return {
      headline: t(`Error: can't connect to any of the nodes on the network`),
      message: t(`Please try entering a custom node address, or try again later.`),
    }
    default: return null;
  }
}

export const getErrorByData = (env: Networks, data?: NodeData) => {
  if (data && !getIsNodeLoading(data)) {
    if (getHasInvalidChain(env, data.chain.value)) {
      return getErrorByType(ErrorType.INVALID_NETWORK, env, data.url);
    }

    if (getHasInvalidUrl(data.url)) {
      return getErrorByType(ErrorType.INVALID_URL, env, data.url);
    }

    if (
      data.chain.hasError ||
      data.responseTime.hasError ||
      data.block.hasError
    ) {
      return getErrorByType(ErrorType.CONNECTION_ERROR, env, data.url);
    }

    if (data.ssl.hasError) {
      return getErrorByType(ErrorType.SSL_ERROR, env, data.url);
    }
  }

  return null;
};
