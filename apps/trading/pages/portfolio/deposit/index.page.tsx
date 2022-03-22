import { useWeb3React } from '@web3-react/core';
import { Web3Provider, Web3ConnectDialog } from '@vegaprotocol/web3-provider';
import { connectors } from '../../../lib/web3-connectors';
import { useEffect, useState } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';

// TODO: Get from env
const CHAIN_ID = 3;

const Deposit = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Web3Provider connectors={connectors}>
      <div>
        <h1>Deposit</h1>
        <Web3ConnectContainer
          appChainId={CHAIN_ID}
          setDialogOpen={setDialogOpen}
        >
          <Info />
        </Web3ConnectContainer>
      </div>
      <Web3ConnectDialog
        connectors={connectors}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        desiredChainId={CHAIN_ID}
      />
    </Web3Provider>
  );
};

const Info = () => {
  const { isActive, chainId, account } = useWeb3React();
  if (!isActive) {
    return <div>Not active</div>;
  }
  return (
    <div>
      <p>{chainId}</p>
      <p>{account}</p>
    </div>
  );
};

export default Deposit;

interface Web3ConnectContainerProps {
  children: JSX.Element;
  appChainId: number;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3ConnectContainer = ({
  children,
  appChainId,
  setDialogOpen,
}: Web3ConnectContainerProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    connector?.connectEagerly();
  }, [connector]);

  if (error) {
    return (
      <>
        <p>Something went wrong: {error.message}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </>
    );
  }

  if (!isActive) {
    return (
      <>
        <p>Connect your Ethereum wallet</p>
        <Button onClick={() => setDialogOpen(true)}>Connect</Button>
      </>
    );
  }

  if (chainId !== appChainId) {
    return (
      <>
        <p>This app only works on chain ID: {appChainId}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </>
    );
  }

  return children;
};
