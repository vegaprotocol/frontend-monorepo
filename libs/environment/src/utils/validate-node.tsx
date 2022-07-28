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

export const getHasInvalidChain = (env: Networks, chain = '') => {
  return !chain.split('-').includes(env.toLowerCase());
};

export const getIsInvalidUrl = (url: string) => {
  try {
    new URL(url);
    return false;
  } catch (err) {
    return true;
  }
};

export const getIsNodeDisabled = (env: Networks, data?: NodeData) => {
  return (
    !!data &&
    (getIsNodeLoading(data) ||
      getHasInvalidChain(env, data.chain.value) ||
      getIsInvalidUrl(data.url) ||
      data.chain.hasError ||
      data.responseTime.hasError ||
      data.block.hasError ||
      data.ssl.hasError)
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
    state[CUSTOM_NODE_KEY] &&
    inputText !== state[CUSTOM_NODE_KEY].url
  ) {
    return true;
  }

  const data = state[currentNode];
  return getIsNodeDisabled(env, data);
};

export const getErrorByType = (
  errorType: ErrorType | undefined | null,
  env: Networks,
  url?: string
) => {
  switch (errorType) {
    case ErrorType.INVALID_URL:
      return {
        headline: t('Error: invalid url'),
        message: t(url ? `${url} is not a valid url.` : ''),
      };
    case ErrorType.INVALID_NETWORK:
      return {
        headline: t(`Error: incorrect network`),
        message: t(`This node is not on the ${env} network.`),
      };
    case ErrorType.SSL_ERROR:
      return {
        headline: t(`Error: the node you are reading from does not have SSL`),
        message: t(
          url
            ? `${url} does not have SSL. SSL is required to subscribe to data.`
            : ''
        ),
      };
    case ErrorType.CONNECTION_ERROR:
      return {
        headline: t(`Error: can't connect to node`),
        message: t(url ? `There was an error connecting to ${url}.` : ''),
      };
    case ErrorType.CONNECTION_ERROR_ALL:
      return {
        headline: t(`Error: can't connect to any of the nodes on the network`),
        message: t(
          `Please try entering a custom node address, or try again later.`
        ),
      };
    case ErrorType.CONFIG_VALIDATION_ERROR:
      return {
        headline: t(
          `Error: the configuration found for the network ${env} is invalid`
        ),
        message: t(
          `Please try entering a custom node address, or try again later.`
        ),
      };
    case ErrorType.CONFIG_LOAD_ERROR:
      return {
        headline: t(`Error: can't load network configuration`),
        message: t(
          `You can try entering a custom node address, or try again later.`
        ),
      };
    default:
      return null;
  }
};

export const getErrorType = (env: Networks, data?: NodeData) => {
  if (data && !getIsNodeLoading(data) && data.initialized) {
    if (getIsInvalidUrl(data.url)) {
      return ErrorType.INVALID_URL;
    }

    if (
      data.chain.hasError ||
      data.responseTime.hasError ||
      data.block.hasError
    ) {
      return ErrorType.CONNECTION_ERROR;
    }

    if (getHasInvalidChain(env, data.chain.value)) {
      return ErrorType.INVALID_NETWORK;
    }

    if (data.ssl.hasError) {
      return ErrorType.SSL_ERROR;
    }
  }

  return null;
};
