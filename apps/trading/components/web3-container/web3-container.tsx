import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3Provider, Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { ReactNode, useEffect, useState } from 'react';
import { connectors } from '../../lib/web3-connectors';

interface Web3ContainerProps {
  children: ReactNode;
}

export const Web3Container = ({ children }: Web3ContainerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Web3Provider connectors={connectors}>
      <Web3Content setDialogOpen={setDialogOpen}>{children}</Web3Content>
      <Web3ConnectDialog
        connectors={connectors}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        desiredChainId={Number(process.env['NX_ETHEREUM_CHAIN_ID'] || 3)}
      />
    </Web3Provider>
  );
};

interface Web3ContentProps {
  children: ReactNode;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Content = ({ children, setDialogOpen }: Web3ContentProps) => {
  const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID'] || 3);
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    connector?.connectEagerly();
  }, [connector]);

  if (error) {
    return (
      <SplashWrapper>
        <p className="mb-12">Something went wrong: {error.message}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </SplashWrapper>
    );
  }

  if (!isActive) {
    return (
      <SplashWrapper>
        <p className="mb-12">Connect your Ethereum wallet</p>
        <Button onClick={() => setDialogOpen(true)}>Connect</Button>
      </SplashWrapper>
    );
  }

  if (chainId !== appChainId) {
    return (
      <SplashWrapper>
        <p className="mb-12">This app only works on chain ID: {appChainId}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </SplashWrapper>
    );
  }

  return <>{children}</>;
};

interface SplashWrapperProps {
  children: ReactNode;
}

const SplashWrapper = ({ children }: SplashWrapperProps) => {
  return (
    <Splash>
      <div className="text-center">{children}</div>
    </Splash>
  );
};
