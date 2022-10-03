import { LocalStorage } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VegaWalletContextShape } from '.';
import type { VegaConnector } from './connectors/vega-connector';
import { VegaWalletContext } from './context';
import { WALLET_KEY } from './storage-keys';
import type { TransactionSubmission } from './wallet-types';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  // Current selected publicKey, default with value from local storage
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    const pk = LocalStorage.getItem(WALLET_KEY);
    return pk ? pk : null;
  });

  // Keypair objects retrieved from the connector
  const [keypairs, setKeypairs] = useState<string[] | null>(null);

  // Reference to the current connector instance
  const connector = useRef<VegaConnector | null>(null);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const keys = await connector.current.connect();

      if (keys?.length) {
        setKeypairs(keys);
        setPublicKey(keys[0]);
        return keys;
      } else {
        return null;
      }
    } catch (err) {
      console.log('FAILED');
      console.error(err);
      return null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setKeypairs(null);
      setPublicKey(null);
      connector.current = null;
      LocalStorage.removeItem(WALLET_KEY);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  const sendTx = useCallback((body: TransactionSubmission) => {
    if (!connector.current) {
      return null;
    }

    return connector.current.sendTx(body);
  }, []);

  // Current selected keypair derived from publicKey state
  const keypair = useMemo(() => {
    const found = keypairs?.find((pk) => pk === publicKey);

    if (found) {
      return found;
    }

    return null;
  }, [publicKey, keypairs]);

  // Whenever selected public key changes store it
  useEffect(() => {
    if (publicKey) {
      LocalStorage.setItem(WALLET_KEY, publicKey);
    }
  }, [publicKey]);

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      keypair,
      keypairs,
      selectPublicKey: setPublicKey,
      connect,
      disconnect,
      connector: connector.current,
      sendTx,
    } as VegaWalletContextShape;
  }, [keypair, keypairs, setPublicKey, connect, disconnect, connector, sendTx]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
