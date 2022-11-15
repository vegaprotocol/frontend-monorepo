import create from 'zustand';
import { t } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import type { Connector } from '@web3-react/types';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import type { createConnectors } from './web3-connectors';

interface State {
  isOpen: boolean;
  connectors: ReturnType<typeof createConnectors>;
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

export const Web3ConnectDialog = () => {
  const { isOpen, connectors, desiredChainId, open, close } =
    useWeb3ConnectDialog();
  return (
    <Dialog
      open={isOpen}
      onChange={(isOpen) =>
        isOpen ? open(connectors, desiredChainId) : close()
      }
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
                  close();
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
