import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { VegaConnector } from './connectors';
import { VegaWalletContext } from './context';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  const [publicKey, setPublicKey] = useState<VegaKey | null>(null);
  const [publicKeys, setPublicKeys] = useState<VegaKey[] | null>(null);
  const connector = useRef<VegaConnector | null>(null);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const res = await c.connect();
      setPublicKeys(res);
      setPublicKey(res[0]);
    } catch (err) {
      console.log('connect failed');
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setPublicKeys(null);
      setPublicKey(null);
      connector.current = null;
    } catch (err) {
      console.log('disconnect failed', err);
    }
  }, []);

  const contextValue = useMemo(() => {
    return {
      publicKey,
      publicKeys,
      connect,
      disconnect,
      connector: connector.current,
    };
  }, [publicKey, publicKeys, connect, disconnect, connector]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
