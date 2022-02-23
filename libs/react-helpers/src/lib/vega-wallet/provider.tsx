import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { VegaKeyExtended, VegaWalletContextShape } from '.';
import { VegaConnector } from './connectors';
import { VegaWalletContext } from './context';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  const [publicKey, setPublicKey] = useState<VegaKeyExtended | null>(null);
  const [publicKeys, setPublicKeys] = useState<VegaKeyExtended[] | null>(null);
  const connector = useRef<VegaConnector | null>(null);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const res = await connector.current.connect();
      const publicKeysWithName = res.map((pk) => {
        const nameMeta = pk.meta?.find((m) => m.key === 'name');
        return {
          ...pk,
          name: nameMeta?.value ? nameMeta.value : 'None',
        };
      });
      setPublicKeys(publicKeysWithName);
      setPublicKey(publicKeysWithName[0]);
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

  const selectPublicKey = useCallback(
    (key: string) => {
      if (!publicKeys || !publicKeys.length) {
        return;
      }

      const selectedKey = publicKeys.find((k) => k.pub === key);

      if (!selectedKey) {
        throw new Error('Public key doesnt exist');
      }

      setPublicKey(selectedKey);
    },
    [publicKeys]
  );

  const contextValue = useMemo<VegaWalletContextShape>(() => {
    return {
      publicKey,
      publicKeys,
      selectPublicKey,
      connect,
      disconnect,
      connector: connector.current,
    };
  }, [publicKey, publicKeys, selectPublicKey, connect, disconnect, connector]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
