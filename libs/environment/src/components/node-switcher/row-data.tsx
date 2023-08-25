import type { ApolloError } from '@apollo/client';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { isValidUrl } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { TradingRadio } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { CUSTOM_NODE_KEY } from '../../types';
import {
  useNodeCheckQuery,
  useNodeCheckTimeUpdateSubscription,
} from '../../utils/__generated__/NodeCheck';
import { LayoutCell } from './layout-cell';

export const POLL_INTERVAL = 1000;
export const BLOCK_THRESHOLD = 3;

export interface RowDataProps {
  id: string;
  url: string;
  highestBlock: number | null;
  onBlockHeight: (blockHeight: number) => void;
}

export const RowData = ({
  id,
  url,
  highestBlock,
  onBlockHeight,
}: RowDataProps) => {
  const [subFailed, setSubFailed] = useState(false);
  const [time, setTime] = useState<number>();
  // no use of data here as we need the data nodes reference to block height
  const { data, error, loading, startPolling, stopPolling } = useNodeCheckQuery(
    {
      pollInterval: POLL_INTERVAL,
      // fix for pollInterval
      // https://github.com/apollographql/apollo-client/issues/9819
      ssr: false,
    }
  );
  const headerStore = useHeaderStore();
  const headers = headerStore[url];

  const {
    data: subData,
    error: subError,
    loading: subLoading,
  } = useNodeCheckTimeUpdateSubscription();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!subData) {
        setSubFailed(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [subData]);

  // handle polling
  useEffect(() => {
    const handleStartPoll = () => {
      if (error) return;
      startPolling(POLL_INTERVAL);
    };
    const handleStopPoll = () => stopPolling();

    // start polling on mount, but only if there is no error
    if (error) {
      handleStopPoll();
    } else {
      handleStartPoll();
    }

    window.addEventListener('blur', handleStopPoll);
    window.addEventListener('focus', handleStartPoll);

    return () => {
      window.removeEventListener('blur', handleStopPoll);
      window.removeEventListener('focus', handleStartPoll);
    };
  }, [startPolling, stopPolling, error]);

  // measure response time
  useEffect(() => {
    if (!isValidUrl(url)) return;
    if (typeof window.performance.getEntriesByName !== 'function') return; // protection for test environment
    // every time we get data measure response speed
    const requestUrl = new URL(url);
    const requests = window.performance.getEntriesByName(requestUrl.href);
    const { duration } =
      (requests.length && requests[requests.length - 1]) || {};
    setTime(duration);
  }, [url, data]);

  useEffect(() => {
    if (headers?.blockHeight) {
      onBlockHeight(headers.blockHeight);
    }
  }, [headers?.blockHeight, onBlockHeight]);

  const getHasError = () => {
    // the stats query errored
    if (error) {
      return true;
    }

    // if we are still awaiting a header entry its not an error
    // we are still waiting for the query to resolve
    if (!headers) {
      return false;
    }

    // highlight this node as 'error' if its more than BLOCK_THRESHOLD blocks behind the most
    // advanced node
    if (
      highestBlock !== null &&
      headers.blockHeight < highestBlock - BLOCK_THRESHOLD
    ) {
      return true;
    }

    return false;
  };

  const getSubFailed = (
    subError: ApolloError | undefined,
    subFailed: boolean
  ) => {
    if (subError) return true;
    if (subFailed) return true;
    return false;
  };

  return (
    <>
      {id !== CUSTOM_NODE_KEY && (
        <div className="break-all" data-testid="node">
          <TradingRadio id={`node-url-${id}`} value={url} label={url} />
        </div>
      )}
      <LayoutCell
        label={t('Response time')}
        isLoading={!error && loading}
        hasError={Boolean(error)}
        dataTestId="response-time-cell"
      >
        {getResponseTimeDisplayValue(time, error)}
      </LayoutCell>
      <LayoutCell
        label={t('Block')}
        isLoading={loading}
        hasError={getHasError()}
        dataTestId="block-height-cell"
      >
        <span
          data-testid="query-block-height"
          data-query-block-height={
            error ? 'failed' : data?.statistics.blockHeight
          }
        >
          {getBlockDisplayValue(headers?.blockHeight, error)}
        </span>
      </LayoutCell>
      <LayoutCell
        label={t('Subscription')}
        isLoading={subFailed ? false : subLoading}
        hasError={getSubFailed(subError, subFailed)}
        dataTestId="subscription-cell"
      >
        {getSubscriptionDisplayValue(subFailed, subData?.busEvents, subError)}
      </LayoutCell>
    </>
  );
};

const getResponseTimeDisplayValue = (
  responseTime?: number,
  error?: ApolloError
) => {
  if (error) {
    return t('n/a');
  }
  if (typeof responseTime === 'number') {
    return `${Number(responseTime).toFixed(2)}ms`;
  }
  return '-';
};

const getBlockDisplayValue = (block?: number, error?: ApolloError) => {
  if (error) {
    return t('n/a');
  }
  if (block) {
    return block;
  }
  return '-';
};

const getSubscriptionDisplayValue = (
  subFailed: boolean,
  events?: { id: string }[] | null,
  error?: ApolloError
) => {
  if (subFailed || error) {
    return t('No');
  }
  if (events?.length) {
    return t('Yes');
  }
  return '-';
};
