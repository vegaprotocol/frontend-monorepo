import { LocalStorage, t } from '@vegaprotocol/react-helpers';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VegaKeyExtended, VegaWalletContextShape } from '.';
import type { VegaConnector } from './connectors';
import { VegaWalletContext } from './context';
import { WALLET_KEY } from './storage-keys';
import type {
  OrderSubmissionBody,
  WithdrawSubmissionBody,
} from '@vegaprotocol/vegawallet-service-api-client';

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
  const [keypairs, setKeypairs] = useState<VegaKeyExtended[] | null>(null);

  // Reference to the current connector instance
  const connector = useRef<VegaConnector | null>(null);

  const connect = useCallback(
    async (c: VegaConnector) => {
      connector.current = c;
      try {
        const res = await connector.current.connect();

        if (!res) {
          return null;
        }

        const publicKeysWithName = res.map((pk) => {
          const nameMeta = pk.meta?.find((m) => m.key === 'name');
          return {
            ...pk,
            name: nameMeta?.value ? nameMeta.value : t('None'),
          };
        });

        setKeypairs(publicKeysWithName);

        if (publicKey === null) {
          setPublicKey(publicKeysWithName[0].pub);
        }

        return publicKeysWithName;
      } catch (err) {
        return null;
      }
    },
    [publicKey]
  );

  const disconnect = useCallback(async () => {
    try {
      await connector.current?.disconnect();
      setKeypairs(null);
      connector.current = null;
      LocalStorage.removeItem(WALLET_KEY);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  const sendTx = useCallback(
    (body: OrderSubmissionBody | WithdrawSubmissionBody) => {
      if (!connector.current) {
        return null;
      }

      return connector.current.sendTx(body);
    },
    []
  );

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
    };
  }, [keypair, keypairs, setPublicKey, connect, disconnect, connector, sendTx]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
    </VegaWalletContext.Provider>
  );
};
