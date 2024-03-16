import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import {
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
  const { open, close, isOpen } = useWeb3ConnectStore();

  const setDialogOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        open();
      } else {
        close();
      }
    },
    [open, close]
  );

  const appChainId = Number(chainId);
  return (
    <>
      <Web3Content appChainId={appChainId}>{children}</Web3Content>
      <Web3ConnectDialog
        connectors={connectors}
        dialogOpen={isOpen}
        setDialogOpen={setDialogOpen}
        desiredChainId={appChainId}
      />
    </>
  );
}

interface Web3ContentProps {
  children: ReactElement;
  appChainId: number;
}

export const Web3Content = ({ children, appChainId }: Web3ContentProps) => {
  const { appState, appDispatch } = useAppState();
  const { connector, chainId } = useWeb3React();
  const [previousChainId, setPreviousChainId] = useState(chainId);
  const error = useWeb3ConnectStore((store) => store.error);
  const disconnect = useWeb3Disconnect();

  const showDisconnectNotice = useCallback(
    (isVisible: boolean) =>
      appDispatch({
        type: AppStateActionType.SET_DISCONNECT_NOTICE,
        isVisible,
      }),
    [appDispatch]
  );

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

        // If the user was previously connected, show the disconnect explanation notice.
        if (previousChainId !== undefined && !appState.disconnectNotice) {
          showDisconnectNotice(true);
        }
      } else if (appState.disconnectNotice) {
        showDisconnectNotice(false);
      }
    }
  }, [
    appChainId,
    appDispatch,
    appState.disconnectNotice,
    chainId,
    disconnect,
    previousChainId,
    showDisconnectNotice,
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

  return children;
};
