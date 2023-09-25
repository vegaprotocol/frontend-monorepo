import { useEffect, useState } from 'react';
import type { JsonRpcConnector } from './connectors';

export const useIsWalletServiceRunning = (
  url: string,
  connector: JsonRpcConnector | undefined
) => {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);

  useEffect(() => {
    if (!connector) return;

    if (url && url !== connector.url) {
      connector.url = url;
    }

    const check = async () => {
      try {
        // we are not checking wallet compatibility here, only that the wallet is running
        await connector.checkCompat();
        setIsRunning(true);
      } catch {
        setIsRunning(false);
      }
    };

    // check immediately
    check();

    // check every second for quick feedback to the user
    const interval = setInterval(check, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [connector, url]);

  return isRunning;
};
