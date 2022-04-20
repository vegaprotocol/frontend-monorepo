import { useVegaWallet, WALLET_CONFIG } from './';
import { useEffect, useState } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from './connectors';

export function useEagerConnect(Connectors: {
  [connector: string]: VegaConnector;
}) {
  const [connecting, setConnecting] = useState(true);
  const { connect } = useVegaWallet();

  useEffect(() => {
    const attemptConnect = async () => {
      const cfg = LocalStorage.getItem(WALLET_CONFIG);
      let cfgObj: { connector: 'rest'; token: string } | null;

      try {
        cfgObj = cfg ? JSON.parse(cfg) : null;
      } catch {
        cfgObj = null;
      }

      // No stored config, or config was malformed
      if (!cfgObj || !cfgObj.connector) {
        setConnecting(false);
        return;
      }

      // Use the connector string in local storage to find the right connector to auto
      // connect to
      const connector = Connectors[cfgObj.connector];

      // Developer hasn't provided this connector
      if (!connector) {
        setConnecting(false);
        console.error(
          `Can't eager connect, connector: ${cfgObj.connector} not found`
        );
        return;
      }

      try {
        await connect(Connectors[cfgObj.connector]);
      } catch {
        console.warn(`Failed to connect with connector: ${cfgObj.connector}`);
      } finally {
        setConnecting(false);
      }
    };

    attemptConnect();
  }, [connect, Connectors]);

  return connecting;
}
