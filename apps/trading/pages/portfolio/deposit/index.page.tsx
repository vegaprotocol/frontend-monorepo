import { useWeb3React } from '@web3-react/core';
import { Web3Container } from '../../../components/web3-container';
import { useEffect } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';

const Deposit = () => {
  return (
    <Web3Container>
      {({ setDialogOpen }) => (
        <div>
          <h1>Deposit</h1>
          <Web3ConnectContainer setDialogOpen={setDialogOpen}>
            <Info />
          </Web3ConnectContainer>
        </div>
      )}
    </Web3Container>
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
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3ConnectContainer = ({
  children,
  setDialogOpen,
}: Web3ConnectContainerProps) => {
  const appChainId = Number(process.env['NX_ETHEREUM_CHAIN_ID'] || 3);
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
