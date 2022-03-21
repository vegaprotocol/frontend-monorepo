import { Button, Dialog, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { ReactNode, useEffect, useState } from 'react';
import * as connectors from '../../lib/web3-connectors';

interface Web3ProviderProps {
  children: ReactNode;
}

const CHAIN_ID = {
  devnet: 3,
  stagnet: 3,
  stagnet2: 3,
  testnet: 3,
  mainnet: 1,
};

const APP_CHAIN_ID = CHAIN_ID[process.env['NX_VEGA_NETWORK']];
console.log(APP_CHAIN_ID);

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Web3ReactProvider
      connectors={Object.values(connectors).map(([connector, hooks]) => {
        return [connector, hooks];
      })}
    >
      <Web3Container setDialogOpen={setDialogOpen}>{children}</Web3Container>
      <Dialog open={dialogOpen} onChange={setDialogOpen} intent={Intent.Prompt}>
        <ul>
          {Object.entries(connectors).map(([connectorName, [connector]]) => {
            return (
              <li key={connectorName} className="mb-4 last:mb-0">
                <Button
                  className="capitalize"
                  onClick={async () => {
                    await connector.activate(APP_CHAIN_ID);
                    setDialogOpen(false);
                  }}
                >
                  {connectorName}
                </Button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </Web3ReactProvider>
  );
};

interface Web3ContainerProps {
  children: ReactNode;
  setDialogOpen: (isOpen: boolean) => void;
}

const Web3Container = ({ children, setDialogOpen }: Web3ContainerProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    connector?.connectEagerly();
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

  return <>{children}</>;
};
