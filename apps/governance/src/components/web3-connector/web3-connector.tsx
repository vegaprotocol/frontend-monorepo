import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import {
  getChainName,
  useWeb3ConnectStore,
  useWeb3Disconnect,
  Web3ConnectDialog,
} from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';

interface Web3ConnectorProps {
  children: ReactElement;
  connectors: [Connector, Web3ReactHooks][];
  chainId: number;
}

export function Web3Connector({
  children,
  connectors,
  chainId,
}: Web3ConnectorProps) {
  const [showDisconnectBanner, setShowDisconnectBanner] = useState(false);
  const { appState, appDispatch } = useAppState();
  const setDialogOpen = useCallback(
    (isOpen: boolean) => {
      appDispatch({ type: AppStateActionType.SET_ETH_WALLET_OVERLAY, isOpen });
    },
    [appDispatch]
  );
  const appChainId = Number(chainId);
  return (
    <>
      <Web3Content
        appChainId={appChainId}
        setShowDisconnectBanner={setShowDisconnectBanner}
        showDisconnectBanner={showDisconnectBanner}
      >
        {children}
      </Web3Content>
      <Web3ConnectDialog
        connectors={connectors}
        dialogOpen={appState.ethConnectOverlay}
        setDialogOpen={setDialogOpen}
        desiredChainId={appChainId}
      />
    </>
  );
}

interface Web3ContentProps {
  children: ReactElement;
  appChainId: number;
  setShowDisconnectBanner: (show: boolean) => void;
  showDisconnectBanner: boolean;
}

export const Web3Content = ({
  children,
  appChainId,
  setShowDisconnectBanner,
  showDisconnectBanner,
}: Web3ContentProps) => {
  const { connector, chainId } = useWeb3React();
  const [previousChainId, setPreviousChainId] = useState(chainId);
  const error = useWeb3ConnectStore((store) => store.error);
  const disconnect = useWeb3Disconnect(connector);

  useEffect(() => {
    if (connector?.connectEagerly) {
      connector.connectEagerly();
    }
    // wallet connect doesn't handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chainId !== undefined) {
      // We use this to detect when the user switches networks.
      setPreviousChainId(chainId);

      if (chainId !== appChainId) {
        disconnect();

        // If the user was previously connected, show the disconnect explanation banner.
        if (previousChainId !== undefined) {
          setShowDisconnectBanner(true);
        }
      } else {
        setShowDisconnectBanner(false);
      }
    }
  }, [
    appChainId,
    chainId,
    disconnect,
    previousChainId,
    setShowDisconnectBanner,
  ]);

  if (error) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="text-white">Something went wrong: {error.message}</p>
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  return (
    <>
      {showDisconnectBanner && (
        <div>
          You have been disconnected. Connect your ethereum wallet to{' '}
          {getChainName(appChainId)} to use this app.
        </div>
      )}
      {children}
    </>
  );
};
