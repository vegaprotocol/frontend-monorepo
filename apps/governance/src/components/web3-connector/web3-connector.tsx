import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import {
  getChainName,
  useWeb3ConnectStore,
  Web3ConnectDialog,
} from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useCallback, useEffect } from 'react';
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
      <Web3Content appChainId={appChainId} setDialogOpen={setDialogOpen}>
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
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Content = ({ children, appChainId }: Web3ContentProps) => {
  const { connector, chainId } = useWeb3React();
  const [error, clearError] = useWeb3ConnectStore((store) => [
    store.error,
    store.clearError,
  ]);

  useEffect(() => {
    if (connector?.connectEagerly) {
      connector.connectEagerly();
    }
    // wallet connect doesnt handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deactivateConnector = () => {
    if (connector.deactivate) {
      connector.deactivate();
    }
    connector.resetState();
    clearError();
  };

  if (error) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="text-white">Something went wrong: {error.message}</p>
          <Button onClick={() => deactivateConnector()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  if (chainId !== undefined && chainId !== appChainId) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="text-white">
            This app only works on {getChainName(appChainId)}
          </p>
          <Button onClick={() => deactivateConnector()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  return children;
};
