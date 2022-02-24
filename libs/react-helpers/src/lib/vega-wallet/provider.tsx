import { LocalStorage } from '@vegaprotocol/storage';
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { VegaKeyExtended, VegaWalletContextShape } from '.';
import { VegaConnector } from './connectors';
import { VegaWalletContext } from './context';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  // Current selected publicKey, default with value from local storage
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    const pk = LocalStorage.getItem('vega_selected_publickey');
    return pk ? pk : null;
  });

  // Keypair objects retrieved from the connector
  const [keypairs, setKeypairs] = useState<VegaKeyExtended[] | null>(null);

  // Reference to the current connector instance
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
      setKeypairs(publicKeysWithName);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setKeypairs(null);
      connector.current = null;
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Current selected keypair derived from publicKey state
  const keypair = useMemo(() => {
    const found = keypairs?.find((x) => x.pub === publicKey);

    if (found) {
      return found;
    }

    return null;
  }, [publicKey, keypairs]);

  // Whenever selected public key changes store it
  useEffect(() => {
    if (publicKey) {
      LocalStorage.setItem('vega_selected_publickey', publicKey);
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
    };
  }, [keypair, keypairs, setPublicKey, connect, disconnect, connector]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
