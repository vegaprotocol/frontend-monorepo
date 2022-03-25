import { useVegaWallet, WALLET_CONFIG } from '@vegaprotocol/wallet';
import { useEffect } from 'react';
import { LocalStorage } from '@vegaprotocol/react-helpers';
import { Connectors } from '../lib/connectors';

export function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    const cfg = LocalStorage.getItem(WALLET_CONFIG);
    const cfgObj = JSON.parse(cfg);

    // No stored config, user has never connected or manually cleared storage
    if (!cfgObj || !cfgObj.connector) {
      return;
    }

    // Use the connector string in local storage to find the right connector to auto
    // connect to
    const connector = Connectors[cfgObj.connector];

    // Developer hasn't provided this connector
    if (!connector) {
      console.warn(
        `Can't eager connect, connector: ${cfgObj.connector} not found`
      );
      return;
    }

    connect(Connectors[cfgObj.connector]);
  }, [connect]);
}
