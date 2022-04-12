import { Button } from '@vegaprotocol/ui-toolkit';
import { Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Connectors } from '../../lib/web3-connectors';
import { SplashScreen } from '../splash-screen';

interface Web3ConnectorProps {
  children: React.ReactElement;
}

export function Web3Connector({ children }: Web3ConnectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID']);
  return (
    <>
      <Web3Content appChainId={appChainId} setDialogOpen={setDialogOpen}>
        {children}
      </Web3Content>
      <Web3ConnectDialog
        connectors={Connectors}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        desiredChainId={appChainId}
      />
    </>
  );
}

interface Web3ContentProps {
  children: ReactNode;
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
      <SplashScreen>
        <p>Something went wrong: {error.message}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </SplashScreen>
    );
  }

  if (!isActive) {
    return (
      <SplashScreen>
        <p>Connect your Ethereum wallet</p>
        <Button onClick={() => setDialogOpen(true)}>Connect</Button>
      </SplashScreen>
    );
  }

  if (chainId !== appChainId) {
    return (
      <SplashScreen>
        <p className="mb-12">This app only works on chain ID: {appChainId}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </SplashScreen>
    );
  }

  return <>{children}</>;
};
