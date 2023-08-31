import { useEffect, useState } from 'react';
import { InjectedConnector } from './connectors/injected-connector';
import { SnapConnector } from './connectors/snap-connector';
import { getConfig } from './storage';
import type { Connectors } from './connectors';
import { useVegaWallet } from './use-vega-wallet';

export function useEagerConnect(connectors: Connectors) {
  const [connecting, setConnecting] = useState(true);
  const { vegaUrl, connect, acknowledgeNeeded } = useVegaWallet();

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
      const connector = connectors[cfg.connector];

      // Developer hasn't provided this connector
      if (!connector) {
        setConnecting(false);
        console.error(
          `Can't eager connect, connector: ${cfg.connector} not found`
        );
        return;
      }

      try {
        if (connector instanceof InjectedConnector) {
          await connector.connectWallet();
          await connect(connector);
        } else if (connector instanceof SnapConnector) {
          connector.nodeAddress = new URL(vegaUrl).origin;
          await connect(connector);
        } else {
          await connect(connector);
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
  }, [connect, connectors, acknowledgeNeeded, vegaUrl]);

  return connecting;
}
