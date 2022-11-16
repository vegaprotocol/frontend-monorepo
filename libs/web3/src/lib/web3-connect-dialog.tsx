import create from 'zustand';
import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';

interface State {
  isOpen: boolean;
  connectors: [Connector, Web3ReactHooks][];
  desiredChainId?: number;
}
interface Actions {
  open: (connectors: State['connectors'], desiredChainId?: number) => void;
  close: () => void;
}

export const useWeb3ConnectDialog = create<State & Actions>((set) => ({
  isOpen: false,
  connectors: [],
  open: (connectors, desiredChainId) =>
    set(() => ({ isOpen: true, connectors, desiredChainId })),
  close: () =>
    set(() => ({ isOpen: false, connectors: [], desiredChainId: undefined })),
}));

interface Web3ConnectDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  connectors: State['connectors'];
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
            <li key={i} className="mb-2 last:mb-0">
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

export const Web3ConnectUncontrolledDialog = () => {
  const { isOpen, connectors, desiredChainId, open, close } =
    useWeb3ConnectDialog();

  const onChange = (isOpen: boolean) =>
    isOpen ? open(connectors, desiredChainId) : close();

  return (
    <Web3ConnectDialog
      dialogOpen={isOpen}
      setDialogOpen={onChange}
      connectors={connectors}
    />
  );
};

function getConnectorInfo(connector: Connector) {
  if (connector instanceof MetaMask) {
    return {
      name: 'MetaMask',
      text: t('MetaMask, Brave or other injected web wallet'),
    };
  }
  if (connector instanceof WalletConnect) {
    return {
      name: 'WalletConnect',
      text: t('WalletConnect'),
    };
  }
  return { name: 'Unknown', text: t('Unknown') };
}
