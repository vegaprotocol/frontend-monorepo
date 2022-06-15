import { useEnvironment } from '@vegaprotocol/environment';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { Button, Splash, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { createConnectors } from '../../lib/web3-connectors';

interface Web3ConnectorProps {
  children: ReactElement;
}

export function Web3Connector({ children }: Web3ConnectorProps) {
  const { appState, appDispatch } = useAppState();
  const { ETHEREUM_PROVIDER_URL } = useEnvironment();
  const { config, loading, error } = useEthereumConfig();
  const Connectors = useMemo(() => {
    if (config) {
      return createConnectors(ETHEREUM_PROVIDER_URL, Number(config.chain_id));
    }
    return undefined;
  }, [config?.chain_id, ETHEREUM_PROVIDER_URL]);
  const setDialogOpen = useCallback(
    (isOpen: boolean) => {
      appDispatch({ type: AppStateActionType.SET_ETH_WALLET_OVERLAY, isOpen });
    },
    [appDispatch]
  );
  const appChainId = Number(config?.chain_id);
  return (
    <AsyncRenderer loading={loading} error={error} data={config}>
      <Web3Content appChainId={appChainId} setDialogOpen={setDialogOpen}>
        {children}
      </Web3Content>
      {Connectors && (
        <Web3ConnectDialog
          connectors={Connectors}
          dialogOpen={appState.ethConnectOverlay}
          setDialogOpen={setDialogOpen}
          desiredChainId={appChainId}
        />
      )}
    </AsyncRenderer>
  );
}

interface Web3ContentProps {
  children: ReactElement;
  appChainId: number;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Content = ({ children, appChainId }: Web3ContentProps) => {
  const { error, connector, chainId } = useWeb3React();

  useEffect(() => {
    if (connector?.connectEagerly) {
      connector.connectEagerly();
    }
  }, [connector]);

  if (error) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p>Something went wrong: {error.message}</p>
          <Button onClick={() => connector.deactivate()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  if (chainId !== undefined && chainId !== appChainId) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="mb-12">This app only works on chain ID: {appChainId}</p>
          <Button onClick={() => connector.deactivate()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  return children;
};
