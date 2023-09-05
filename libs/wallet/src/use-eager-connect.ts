import { useVegaWallet } from './';
import { useEffect, useState } from 'react';
import type { VegaConnector } from './connectors/vega-connector';
import { getConfig } from './storage';

export function useEagerConnect(Connectors: {
  [connector: string]: VegaConnector;
}) {
  const [connecting, setConnecting] = useState(true);
  const { connect, acknowledgeNeeded } = useVegaWallet();

  useEffect(() => {
    const attemptConnect = async () => {
      const cfg = getConfig();
      // No stored config, or config was malformed or no risk accepted
      if (!cfg || !cfg.connector || acknowledgeNeeded) {
        setConnecting(false);
        return;
      }

      // Use the connector string in local storage to find the right connector to auto
      // connect to
      const connector = Connectors[cfg.connector];

      // Developer hasn't provided this connector
      if (!connector) {
        setConnecting(false);
        console.error(
          `Can't eager connect, connector: ${cfg.connector} not found`
        );
        return;
      }
      try {
        if (cfg.connector === 'injected') {
          const injectedInstance = Connectors[cfg.connector];
          // @ts-ignore only injected wallet has connectWallet method
          await injectedInstance.connectWallet();
          await connect(injectedInstance);
        } else {
          await connect(Connectors[cfg.connector]);
        }
      } catch {
        console.warn(`Failed to connect with connector: ${cfg.connector}`);
      } finally {
        setConnecting(false);
      }
    };

    if (typeof window !== 'undefined') {
      attemptConnect();
    }
  }, [connect, Connectors, acknowledgeNeeded]);

  return connecting;
}
