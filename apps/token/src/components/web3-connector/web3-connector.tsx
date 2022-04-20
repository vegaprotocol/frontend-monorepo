import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useCallback, useEffect } from 'react';
import {
  AppStateActionType,
  useAppState,
} from '../../contexts/app-state/app-state-context';
import { Connectors } from '../../lib/web3-connectors';

interface Web3ConnectorProps {
  children: ReactElement;
}

export function Web3Connector({ children }: Web3ConnectorProps) {
  const { appState, appDispatch } = useAppState();
  const setDialogOpen = useCallback(
    (isOpen: boolean) => {
      appDispatch({ type: AppStateActionType.SET_ETH_WALLET_OVERLAY, isOpen });
    },
    [appDispatch]
  );
  const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID']);
  return (
    <>
      <Web3Content appChainId={appChainId} setDialogOpen={setDialogOpen}>
        {children}
      </Web3Content>
      <Web3ConnectDialog
        connectors={Connectors}
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

export const Web3Content = ({
  children,
  appChainId,
  setDialogOpen,
}: Web3ContentProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

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

  // if (!isActive) {
  //   return (
  //     <Splash>
  //       <div className="flex flex-col items-center gap-12">
  //         <p className="m-0">Connect your Ethereum wallet</p>
  //         <Button onClick={() => setDialogOpen(true)}>Connect</Button>
  //       </div>
  //     </Splash>
  //   );
  // }

  // if (chainId !== appChainId) {
  //   return (
  //     <Splash>
  //       <div className="flex flex-col items-center gap-12">
  //         <p className="m-0">Connect your Ethereum wallet</p>
  //         <p className="mb-12">This app only works on chain ID: {appChainId}</p>
  //         <Button onClick={() => connector.deactivate()}>Disconnect</Button>
  //       </div>
  //     </Splash>
  //   );
  // }

  return children;
};
