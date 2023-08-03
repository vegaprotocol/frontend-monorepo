import type { VegaConnector } from './connectors';
import { useCallback, useEffect, useState } from 'react';
import type { JsonRpcConnector } from './connectors';
import { ClientErrors } from './connectors';

export const useIsDesktopWalletRunning = (
  url: string,
  connectors: { [key: string]: VegaConnector },
  appChainId: string
) => {
  const [run, setRun] = useState(false);

  const checkState = useCallback(async () => {
    const connector = connectors['jsonRpc'] as JsonRpcConnector;
    connector.url = url;
    try {
      await connector.checkCompat();
      const chainIdResult = await connector.getChainId();
      if (chainIdResult.chainID !== appChainId) {
        throw ClientErrors.WRONG_NETWORK;
      }
    } catch (e) {
      return false;
    }
    return true;
  }, [connectors, url, appChainId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    checkState().then((value) => {
      setRun(value);
      interval = setInterval(async () => {
        setRun(await checkState());
      }, 1000 * 10);
    });
    return () => {
      clearInterval(interval);
    };
  }, [checkState]);

  return run;
};
