import { VegaKey } from '@vegaprotocol/vegawallet-service-api-client';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { ConnectDialog } from './connect-dialog';
import { VegaConnector } from './vega-wallet-connectors';
import { VegaWalletContext } from './vega-wallet-context';

interface VegaWalletProviderProps {
  children: ReactNode;
}

export const VegaWalletProvider = ({ children }: VegaWalletProviderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publicKey, setPublicKey] = useState<VegaKey | null>(null);
  const [publicKeys, setPublicKeys] = useState<VegaKey[] | null>(null);
  const connector = useRef<VegaConnector | null>(null);

  const setConnectDialog = useCallback((isOpen?: boolean) => {
    setDialogOpen((curr) => {
      if (isOpen === undefined) return !curr;
      return isOpen;
    });
  }, []);

  const connect = useCallback(async (c: VegaConnector) => {
    connector.current = c;
    try {
      const res = await c.connect();
      setPublicKeys(res);
    } catch (err) {
      console.log('connect failed');
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!connector.current) return;
    try {
      await connector.current.disconnect();
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
      setConnectDialog,
      connect,
      disconnect,
      connector: connector.current,
    };
  }, [publicKey, publicKeys, connect, disconnect, setConnectDialog, connector]);

  return (
    <VegaWalletContext.Provider value={contextValue}>
      {children}
      <ConnectDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        connect={connect}
      />
    </VegaWalletContext.Provider>
  );
};
