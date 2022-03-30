import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import type { Connectors } from './types';

interface Web3ConnectDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  connectors: Connectors;
  desiredChainId?: number;
}

export const Web3ConnectDialog = ({
  dialogOpen,
  setDialogOpen,
  connectors,
  desiredChainId,
}: Web3ConnectDialogProps) => {
  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={Intent.Prompt}
      title="Connect to your Ethereum wallet"
    >
      <ul data-testid="web3-connector-list">
        {Object.entries(connectors).map(([connectorName, [connector]]) => {
          return (
            <li key={connectorName} className="mb-12 last:mb-0">
              <button
                className="capitalize hover:text-vega-pink dark:hover:text-vega-yellow underline"
                data-testid={`web3-connector-${connectorName}`}
                onClick={async () => {
                  await connector.activate(desiredChainId);
                  setDialogOpen(false);
                }}
              >
                {connectorName}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
};
