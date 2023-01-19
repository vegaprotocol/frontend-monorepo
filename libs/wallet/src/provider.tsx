import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { VegaWalletContextShape } from '.';
import type {
  PubKey,
  Transaction,
  VegaConnector,
} from './connectors/vega-connector';
import { VegaWalletContext } from './context';
import { WALLET_KEY } from './storage';
import { WalletError } from './connectors/vega-connector';
import { ViewConnector } from './connectors';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  // Current selected pubKey
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Arary of pubkeys retrieved from the connector
  const [pubKeys, setPubKeys] = useState<PubKey[] | null>(null);

  // Reference to the current connector instance
  const connector = useRef<VegaConnector | null>(null);

  const selectPubKey = useCallback((pk: string) => {
    setPubKey(pk);
    LocalStorage.setItem(WALLET_KEY, pk);
  }, []);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const keys = await connector.current.connect();

      if (keys?.length) {
        setPubKeys(keys);
        setIsReadOnly(connector.current instanceof ViewConnector);
        const lastUsedPubKey = LocalStorage.getItem(WALLET_KEY);
        const foundKey = keys.find((key) => key.publicKey === lastUsedPubKey);
        if (foundKey) {
          setPubKey(foundKey.publicKey);
        } else {
          setPubKey(keys[0].publicKey);
        }

        return keys;
      } else {
        return null;
      }
    } catch (err) {
      if (err instanceof WalletError) {
        throw err;
      }
      return null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    // always clear state after attempted disconnection.. this
    // is because long lived token sessions (used in tests)
    // cannot be cleared. Clearing state will force user to reconnect
    // again as expected
    setPubKeys(null);
    setPubKey(null);
    setIsReadOnly(false);
    LocalStorage.removeItem(WALLET_KEY);
    try {
      await connector.current?.disconnect();
      connector.current = null;
    } catch (err) {
      console.error(err);
      connector.current = null;
    }
  }, []);

  const sendTx = useCallback((pubkey: string, transaction: Transaction) => {
    if (!connector.current) {
      throw new Error('No connector');
    }

    return connector.current.sendTx(pubkey, transaction);
  }, []);

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      isReadOnly,
      pubKey,
      pubKeys,
      selectPubKey,
      connect,
      disconnect,
      sendTx,
    };
  }, [isReadOnly, pubKey, pubKeys, selectPubKey, connect, disconnect, sendTx]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
