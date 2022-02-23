import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { VegaKeyExtended, VegaWalletContextShape } from '.';
import { VegaConnector } from './connectors';
import { VegaWalletContext } from './context';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  const [publicKeys, setPublicKeys] = useState<VegaKeyExtended[] | null>(null);
  const connector = useRef<VegaConnector | null>(null);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const res = await connector.current.connect();

      if (!res) {
        console.log('connect failed', res);
        return;
      }

      const publicKeysWithName = res.map((pk) => {
        const nameMeta = pk.meta?.find((m) => m.key === 'name');
        return {
          ...pk,
          name: nameMeta?.value ? nameMeta.value : 'None',
        };
      });
      setPublicKeys(publicKeysWithName);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setPublicKeys(null);
      connector.current = null;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      publicKeys,
      connect,
      disconnect,
      connector: connector.current,
    };
  }, [publicKeys, connect, disconnect, connector]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
