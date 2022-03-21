import { Button, Dialog, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { ReactNode, useState } from 'react';
import * as connectors from '../../lib/web3-connectors';

interface Web3ProviderProps {
  children: ReactNode;
}

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
                    await connector.activate();
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
  const { isActive, error } = useWeb3React();

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

  return <>{children}</>;
};
