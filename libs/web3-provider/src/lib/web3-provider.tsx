import { Button, Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { Web3ReactProvider, Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { useState } from 'react';
import { Web3Container } from './web3-container';

export type Connectors = {
  [name: string]: [Connector, Web3ReactHooks, object];
};
type Connector = MetaMask | WalletConnect;

interface Web3ProviderProps {
  children: JSX.Element;
  connectors: Connectors;
}

export const Web3Provider = ({ children, connectors }: Web3ProviderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Web3ReactProvider
      connectors={Object.values(connectors).map(([connector, hooks]) => {
        return [connector, hooks];
      })}
    >
      <Web3Container setDialogOpen={setDialogOpen}>{children}</Web3Container>
      <Dialog open={dialogOpen} onChange={setDialogOpen} intent={Intent.Prompt}>
        <ul data-testid="web3-connector-list">
          {Object.entries(connectors).map(([connectorName, [connector]]) => {
            return (
              <li key={connectorName} className="mb-4 last:mb-0">
                <Button
                  className="capitalize"
                  data-testid={`web3-connector-${connectorName}`}
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
