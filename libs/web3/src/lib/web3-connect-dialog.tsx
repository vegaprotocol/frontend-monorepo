import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

interface Web3ConnectDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  connectors: [Connector, Web3ReactHooks][];
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
      intent={Intent.Primary}
      title={t('Connect to your Ethereum wallet')}
    >
      <ul data-testid="web3-connector-list">
        {connectors.map(([connector], i) => {
          const info = getConnectorInfo(connector);
          return (
            <li key={i} className="mb-12 last:mb-0">
              <button
                className="hover:text-vega-pink dark:hover:text-vega-yellow underline"
                data-testid={`web3-connector-${info.name}`}
                onClick={async () => {
                  await connector.activate(desiredChainId);
                  setDialogOpen(false);
                }}
              >
                {info.text}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
};

function getConnectorInfo(connector: Connector) {
  if (connector instanceof MetaMask)
    return {
      name: 'MetaMask',
      text: t('MetaMask, Brave or other injected web wallet'),
    };
  if (connector instanceof WalletConnect)
    return {
      name: 'WalletConnect',
      text: t('WalletConnect'),
    };
  return { name: 'Unknown', text: t('Unknown') };
}
