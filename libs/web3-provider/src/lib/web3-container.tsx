import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { APP_CHAIN_ID } from '../config/chain-id';

interface Web3ContainerProps {
  children: JSX.Element;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Container = ({
  children,
  setDialogOpen,
}: Web3ContainerProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    // connector?.connectEagerly();
  }, [connector]);

  if (error) {
    return (
      <Splash>
        <p>{error.message}</p>
      </Splash>
    );
  }

  if (!isActive) {
    return (
      <Splash>
        <div className="text-center">
          <p className="mb-12">Connect your Ethereum wallet</p>
          <Button onClick={() => setDialogOpen(true)}>Connect</Button>
        </div>
      </Splash>
    );
  }

  if (chainId !== APP_CHAIN_ID) {
    return (
      <Splash>
        <p>This app only works on chain ID: {APP_CHAIN_ID}</p>
      </Splash>
    );
  }

  return children;
};
