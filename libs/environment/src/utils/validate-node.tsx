import { t } from '@vegaprotocol/react-helpers';
import { ErrorType } from '../types';
import type { Networks, NodeData } from '../types';

export const getIsNodeLoading = (node?: NodeData): boolean => {
  if (!node) return false;
  return (
    node.chain.isLoading ||
    node.responseTime.isLoading ||
    node.block.isLoading ||
    node.subscription.isLoading
  );
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
      getIsInvalidUrl(data.url) ||
      data.chain.hasError ||
      data.responseTime.hasError ||
      data.block.hasError ||
      data.subscription.hasError)
  );
};

export const getIsFormDisabled = (
  currentNode: string | undefined,
  env: Networks,
  state: Record<string, NodeData>
) => {
  if (!currentNode) {
    return true;
  }

  const data = state[currentNode];
  return data ? getIsNodeDisabled(env, data) : true;
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
    case ErrorType.SUBSCRIPTION_ERROR:
      return {
        headline: t(`Error: the node you are reading from does not emit data`),
        message: t(
          url
            ? `${url} is required to have subscriptions working to enable data updates on the page.`
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
  if (data && data.initialized) {
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

    if (data.subscription.hasError) {
      return ErrorType.SUBSCRIPTION_ERROR;
    }
  }

  return null;
};
