import create from 'zustand';
import { t, useLocalStorage } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import type { Web3ReactHooks } from '@web3-react/core';
import type { Connector } from '@web3-react/types';
import { ETHEREUM_EAGER_CONNECT } from './use-eager-connect';

interface State {
  isOpen: boolean;
  connectors: [Connector, Web3ReactHooks][];
  desiredChainId?: number;
}
interface Actions {
  initialize: (
    connectors: [MetaMask | WalletConnect, Web3ReactHooks][],
    desiredChainId: number
  ) => void;
  open: () => void;
  close: () => void;
}

export const useWeb3ConnectDialog = create<State & Actions>((set) => ({
  isOpen: false,
  connectors: [],
  initialize: (connectors, desiredChainId) => {
    set({ connectors, desiredChainId });
  },
  open: () => set(() => ({ isOpen: true })),
  close: () => set(() => ({ isOpen: false })),
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
  const [, setEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);

  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={Intent.Primary}
      title={t('Connect to your Ethereum wallet')}
    >
      <ul data-testid="web3-connector-list">
        {connectors.map(([connector], i) => {
          const text = getConnectorText(connector);
          // @ts-ignore additional field tagged onto class
          const name = connector.connectorName;
          return (
            <li key={i} className="mb-2 last:mb-0">
              <button
                className="hover:text-vega-pink dark:hover:text-vega-yellow underline"
                data-testid={`web3-connector-${name}`}
                onClick={async () => {
                  await connector.activate(desiredChainId);
                  setEagerConnector(name);
                  setDialogOpen(false);
                }}
              >
                {text}
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
};

export const Web3ConnectUncontrolledDialog = () => {
  const { isOpen, connectors, open, close, desiredChainId } =
    useWeb3ConnectDialog();
  const onChange = (isOpen: boolean) => (isOpen ? open() : close());

  return (
    <Web3ConnectDialog
      dialogOpen={isOpen}
      setDialogOpen={onChange}
      connectors={connectors}
      desiredChainId={desiredChainId}
    />
  );
};

function getConnectorText(connector: Connector) {
  if (connector instanceof MetaMask) {
    return t('MetaMask, Brave or other injected web wallet');
  }
  if (connector instanceof WalletConnect) {
    return t('WalletConnect');
  }
  return t('Unknown');
}
