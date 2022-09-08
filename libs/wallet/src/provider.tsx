import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { VegaWalletContextShape } from '.';
import type { Transaction, VegaConnector } from './connectors/vega-connector';
import { VegaWalletContext } from './context';
import { WALLET_KEY } from './storage';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  // Current selected publicKey, default with value from local storage
  const [pubKey, setPubKey] = useState<string | null>(() => {
    const pk = LocalStorage.getItem(WALLET_KEY);
    return pk ? pk : null;
  });

  // Keypair objects retrieved from the connector
  const [pubKeys, setPubKeys] = useState<string[] | null>(null);

  // Reference to the current connector instance
  const connector = useRef<VegaConnector | null>(null);

  const selectPublicKey = useCallback((pk: string) => {
    setPubKey(pk);
    LocalStorage.setItem(WALLET_KEY, pk);
  }, []);

  const connect = useCallback(
    async (c: VegaConnector) => {
      connector.current = c;
      try {
        const keys = await connector.current.connect();

        if (keys?.length) {
          setPubKeys(keys);
          if (pubKey === null) {
            setPubKey(keys[0]);
          }
          return keys;
        } else {
          return null;
        }
      } catch (err) {
        return null;
      }
    },
    [pubKey]
  );

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setPubKeys(null);
      setPubKey(null);
      connector.current = null;
      LocalStorage.removeItem(WALLET_KEY);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  const sendTx = useCallback((pubkey: string, transaction: Transaction) => {
    if (!connector.current) {
      return null;
    }

    return connector.current.sendTx(pubkey, transaction);
  }, []);

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      keypair: pubKey,
      keypairs: pubKeys,
      selectPublicKey,
      connect,
      disconnect,
      connector: connector.current,
      sendTx,
    } as VegaWalletContextShape;
  }, [
    pubKey,
    pubKeys,
    selectPublicKey,
    connect,
    disconnect,
    connector,
    sendTx,
  ]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
