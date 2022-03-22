import { ReactNode, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';

interface Web3ContainerProps {
  children: JSX.Element;
  appChainId: number;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Container = ({
  children,
  appChainId,
  setDialogOpen,
}: Web3ContainerProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    connector?.connectEagerly();
  }, [connector]);

  if (error) {
    return (
      <Splash>
        <Web3SplashContent message={`Something went wrong: ${error.message}`}>
          <Button onClick={() => connector.deactivate()}>Disconnect</Button>
        </Web3SplashContent>
      </Splash>
    );
  }

  if (!isActive) {
    return (
      <Splash>
        <Web3SplashContent message="Connect your Ethereum wallet">
          <Button onClick={() => setDialogOpen(true)}>Connect</Button>
        </Web3SplashContent>
      </Splash>
    );
  }

  if (chainId !== appChainId) {
    return (
      <Splash>
        <Web3SplashContent
          message={`This app only works on chain ID: ${appChainId}`}
        >
          <Button onClick={() => connector.deactivate()}>Disconnect</Button>
        </Web3SplashContent>
      </Splash>
    );
  }

  return children;
};

interface Web3SplashContentProps {
  message: string;
  children: ReactNode;
}

export const Web3SplashContent = ({
  message,
  children,
}: Web3SplashContentProps) => {
  return (
    <div className="text-center">
      <p className="mb-12">{message}</p>
      {children}
    </div>
  );
};
