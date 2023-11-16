import { useEffect, useMemo } from 'react';
import { useNodeCheckQuery } from '../utils/__generated__/NodeCheck';
import { useHeaderStore } from '@vegaprotocol/apollo-client';
import { useEnvironment } from './use-environment';
import { useNavigatorOnline } from '@vegaprotocol/react-helpers';
import { Intent } from '@vegaprotocol/ui-toolkit';
import { isTestEnv } from '@vegaprotocol/utils';
import { useT } from '../use-t';

const POLL_INTERVAL = 1000;
const BLOCK_THRESHOLD = 3;
const ERROR_LATENCY = 10000;
const WARNING_LATENCY = 3000;

export const useNodeHealth = () => {
  const t = useT();
  const online = useNavigatorOnline();
  const url = useEnvironment((store) => store.VEGA_URL);
  const headerStore = useHeaderStore();
  const headers = url ? headerStore[url] : undefined;
  const { data, error, startPolling, stopPolling } = useNodeCheckQuery({
    fetchPolicy: 'no-cache',
  });

  const blockDiff = useMemo(() => {
    if (!data?.statistics?.blockHeight) {
      return null;
    }

    if (!headers?.blockHeight) {
      return 0;
    }

    return Number(data.statistics.blockHeight) - headers.blockHeight;
  }, [data?.statistics?.blockHeight, headers?.blockHeight]);

  useEffect(() => {
    if (error) {
      stopPolling();
      return;
    }

    if (!isTestEnv() && window.location.hostname !== 'localhost') {
      startPolling(POLL_INTERVAL);
    }
  }, [error, startPolling, stopPolling]);

  const blockUpdateMsLatency = headers?.timestamp
    ? Date.now() - headers.timestamp.getTime()
    : 0;

  const [text, intent] = useMemo(() => {
    let intent = Intent.Success;
    let text = t('Operational');

    if (!online) {
      text = t('Offline');
      intent = Intent.Danger;
    } else if (blockDiff === null) {
      // Block height query failed and null was returned
      text = t('Non operational');
      intent = Intent.Danger;
    } else if (blockUpdateMsLatency > ERROR_LATENCY) {
      text = t(
        'Erroneous latency ( >{{errorLatency}} sec): {{blockUpdateLatency}} sec',
        {
          errorLatency: (ERROR_LATENCY / 1000).toString(),
          blockUpdateLatency: (blockUpdateMsLatency / 1000).toFixed(2),
        }
      );
      intent = Intent.Danger;
    } else if (blockDiff >= BLOCK_THRESHOLD) {
      text = t('blocksBehind', {
        defaultValue: '{{count}} Blocks behind',
        replace: { count: blockDiff },
      });
      intent = Intent.Warning;
    } else if (blockUpdateMsLatency > WARNING_LATENCY) {
      text = t(
        'Warning delay ( >{{warningLatency}} sec): {{blockUpdateLatency}} sec',
        {
          warningLatency: (WARNING_LATENCY / 1000).toString(),
          blockUpdateLatency: (blockUpdateMsLatency / 1000).toFixed(2),
        }
      );
      intent = Intent.Warning;
    }
    return [text, intent];
  }, [online, blockDiff, blockUpdateMsLatency, t]);

  return {
    datanodeBlockHeight: headers?.blockHeight,
    text,
    intent,
  };
};
