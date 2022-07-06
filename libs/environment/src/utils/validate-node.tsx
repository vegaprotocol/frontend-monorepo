import { t } from '@vegaprotocol/react-helpers';
import { CUSTOM_NODE_KEY } from '../types';
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

const getHasInvalidChain = (env: Networks, chain?: string) => {
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

export const getErrorMessage = (env: Networks, data?: NodeData) => {
  if (data && !getIsNodeLoading(data)) {
    if (getHasInvalidChain(env, data.chain.value)) {
      return {
        headline: t(`Error: incorrect network`),
        message: t(`This node is not on the ${env} network.`),
      };
    }

    if (getHasInvalidUrl(data.url)) {
      return {
        headline: t('Error: invalid url'),
        message: t(`${data.url} is not a valid url.`),
      };
    }

    if (
      data.chain.hasError ||
      data.responseTime.hasError ||
      data.block.hasError
    ) {
      return {
        headline: t(`Error: can't connect to node`),
        message: t(`There was an error connecting to ${data.url}.`),
      };
    }

    if (data.ssl.hasError) {
      return {
        headline: t(`Error: the node you are reading from does not have SSL`),
        message: t(
          '${data.url} does not have SSL. SSL is required to subscribe to data.'
        ),
      };
    }
  }

  return {
    message: undefined,
    headline: undefined,
  };
};
