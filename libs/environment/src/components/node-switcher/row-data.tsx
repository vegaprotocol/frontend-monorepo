import type { ApolloError } from '@apollo/client';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { isValidUrl, t } from '@vegaprotocol/react-helpers';
import { Radio } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { CUSTOM_NODE_KEY } from '../../types';
import {
  useBlockTimeSubscription,
  useStatisticsQuery,
} from '../../utils/__generated__/Node';
import { LayoutCell } from './layout-cell';

const POLL_INTERVAL = 1000;
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
  const [time, setTime] = useState<number>();
  // no use of data here as we need the data nodes reference to block height
  const { data, error, loading, startPolling, stopPolling } =
    useStatisticsQuery({
      pollInterval: POLL_INTERVAL,
      // fix for pollInterval
      // https://github.com/apollographql/apollo-client/issues/9819
      ssr: false,
    });
  const headerStore = useHeaderStore();
  const headers = headerStore[url];

  const {
    data: subData,
    error: subError,
    loading: subLoading,
  } = useBlockTimeSubscription();

  useEffect(() => {
    // stop polling if row has errored
  }, [error, stopPolling]);

  useEffect(() => {
    const handleStartPoll = () => startPolling(POLL_INTERVAL);
    const handleStopPoll = () => stopPolling();

    window.addEventListener('blur', handleStopPoll);
    window.addEventListener('focus', handleStartPoll);

    handleStartPoll();

    if (error) {
      stopPolling();
    }

    return () => {
      window.removeEventListener('blur', handleStopPoll);
      window.removeEventListener('focus', handleStartPoll);
    };
  }, [startPolling, stopPolling, error]);

  useEffect(() => {
    if (!isValidUrl(url)) return;
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

  const getIsNodeDisabled = () => {
    if (!isValidUrl(url)) {
      return true;
    }

    // if still waiting or query errored disable node
    if (loading || error) {
      return true;
    }

    if (subLoading || subError) {
      return true;
    }

    // if we are still waiting for a header entry for this
    // url disable the node
    if (!headers) {
      return true;
    }

    return false;
  };

  return (
    <>
      {id !== CUSTOM_NODE_KEY && (
        <div className="break-all" data-testid="node">
          <Radio
            id={`node-url-${id}`}
            value={url}
            label={url}
            disabled={getIsNodeDisabled()}
          />
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
        {getBlockDisplayValue(headers?.blockHeight, error)}
      </LayoutCell>
      <LayoutCell
        label={t('Subscription')}
        isLoading={subLoading}
        hasError={Boolean(subError)}
        dataTestId="subscription-cell"
      >
        {getSubscriptionDisplayValue(subData?.busEvents, subError)}
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
  events?: { id: string }[] | null,
  error?: ApolloError
) => {
  if (error) {
    return t('No');
  }
  if (events?.length) {
    return t('Yes');
  }
  return '-';
};
