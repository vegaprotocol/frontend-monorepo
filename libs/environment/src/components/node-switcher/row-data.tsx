import {
  CopyWithTooltip,
  TradingRadio,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { CUSTOM_NODE_KEY } from '../../types';
import {
  useNodeCheckQuery,
  useNodeCheckTimeUpdateSubscription,
} from '../../utils/__generated__/NodeCheck';
import { LayoutCell } from './layout-cell';
import { useT } from '../../use-t';
import { useResponseTime } from '../../utils/time';

export const POLL_INTERVAL = 1000;
export const SUBSCRIPTION_TIMEOUT = 3000;
export const BLOCK_THRESHOLD = 3;

export interface RowDataProps {
  id: string;
  url: string;
  highestBlock: number | null;
  onBlockHeight: (blockHeight: number) => void;
}

export enum Result {
  Successful,
  Failed,
  Loading,
}

export const useNodeSubscriptionStatus = () => {
  const [status, setStatus] = useState<Result>(Result.Loading);
  const { data, error } = useNodeCheckTimeUpdateSubscription();
  useEffect(() => {
    if (error) {
      setStatus(Result.Failed);
    }
    if (data?.busEvents && data.busEvents.length > 0) {
      setStatus(Result.Successful);
    }
    // set as failed when no data received after SUBSCRIPTION_TIMEOUT ms
    const timeout = setTimeout(() => {
      if (!data || error) {
        setStatus(Result.Failed);
      }
    }, SUBSCRIPTION_TIMEOUT);
    return () => {
      clearTimeout(timeout);
    };
  }, [data, error]);

  return { status };
};

export const useNodeBasicStatus = () => {
  const [status, setStatus] = useState<Result>(Result.Loading);

  const { data, error, loading, startPolling, stopPolling } = useNodeCheckQuery(
    {
      pollInterval: POLL_INTERVAL,
      // fix for pollInterval
      // https://github.com/apollographql/apollo-client/issues/9819
      ssr: false,
    }
  );

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

  const currentBlockHeight = parseInt(
    data?.statistics.blockHeight || 'NONE',
    10
  );

  useEffect(() => {
    if (loading) {
      setStatus(Result.Loading);
      return;
    }
    if (!error && !isNaN(currentBlockHeight)) {
      setStatus(Result.Successful);
      return;
    }
    setStatus(Result.Failed);
  }, [currentBlockHeight, error, loading]);

  return {
    status,
    currentBlockHeight,
  };
};

export const RowData = ({
  id,
  url,
  highestBlock,
  onBlockHeight,
}: RowDataProps) => {
  const t = useT();
  const { status: subStatus } = useNodeSubscriptionStatus();
  const { status, currentBlockHeight } = useNodeBasicStatus();
  const { responseTime } = useResponseTime(url, currentBlockHeight); // measure response time (ms) every time we get data (block height)
  useEffect(() => {
    if (!isNaN(currentBlockHeight)) {
      onBlockHeight(currentBlockHeight);
    }
  }, [currentBlockHeight, onBlockHeight]);

  return (
    <>
      {id !== CUSTOM_NODE_KEY && (
        <div className="break-all flex gap-2" data-testid="node">
          <TradingRadio id={`node-url-${id}`} value={url} label={url} />
          {url.length > 0 && url !== 'custom' && (
            <span className="text-muted">
              <CopyWithTooltip text={url}>
                <button>
                  <VegaIcon name={VegaIconNames.COPY} />
                </button>
              </CopyWithTooltip>
            </span>
          )}
        </div>
      )}
      <LayoutCell
        label={t('Response time')}
        isLoading={status === Result.Loading}
        hasError={status === Result.Failed}
        dataTestId="response-time-cell"
      >
        {display(status, formatResponseTime(responseTime), t('n/a'))}
      </LayoutCell>
      <LayoutCell
        label={t('Block')}
        isLoading={status === Result.Loading}
        hasError={
          status === Result.Failed ||
          (highestBlock != null &&
            !isNaN(currentBlockHeight) &&
            currentBlockHeight < highestBlock - BLOCK_THRESHOLD)
        }
        dataTestId="block-height-cell"
      >
        <span
          data-testid="query-block-height"
          data-query-block-height={
            status === Result.Failed ? 'failed' : currentBlockHeight
          }
        >
          {display(status, currentBlockHeight, t('n/a'))}
        </span>
      </LayoutCell>
      <LayoutCell
        label={t('Subscription')}
        isLoading={subStatus === Result.Loading}
        hasError={subStatus === Result.Failed}
        dataTestId="subscription-cell"
      >
        {display(subStatus, t('Yes'), t('No'))}
      </LayoutCell>
    </>
  );
};

const formatResponseTime = (time: number | undefined) =>
  time != null ? `${Number(time).toFixed(2)}ms` : '-';

const display = (
  status: Result,
  yes: string | number | undefined,
  no: string | number | undefined
) => {
  switch (status) {
    case Result.Successful:
      return yes;
    case Result.Failed:
      return no;
    default:
      return '-';
  }
};
