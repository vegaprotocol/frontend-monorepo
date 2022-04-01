import { useVegaWallet, WALLET_CONFIG } from '@vegaprotocol/wallet';
import { useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { Connectors } from '../lib/vega-connectors';
import { captureException } from '@sentry/nextjs';

export function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    const cfg = LocalStorage.getItem(WALLET_CONFIG);
    let cfgObj: { connector: 'rest'; token: string } | null;

    try {
      cfgObj = cfg ? JSON.parse(cfg) : null;
    } catch {
      cfgObj = null;
    }

    // No stored config, or config was malformed
    if (!cfgObj || !cfgObj.connector) {
      return;
    }

    // Use the connector string in local storage to find the right connector to auto
    // connect to
    const connector = Connectors[cfgObj.connector];

    // Developer hasn't provided this connector
    if (!connector) {
      captureException(
        new Error(
          `Can't eager connect, connector: ${cfgObj.connector} not found`
        )
      );
      return;
    }

    connect(Connectors[cfgObj.connector]);
  }, [connect]);
}
