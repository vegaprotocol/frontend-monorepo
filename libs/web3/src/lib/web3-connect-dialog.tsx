import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import type { Connector } from '@web3-react/types';
import { ETHEREUM_EAGER_CONNECT } from './use-eager-connect';
import type { Web3ReactHooks } from '@web3-react/core';
import { useWeb3ConnectStore } from './web3-connect-store';

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
  const [, setEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);

  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      intent={Intent.None}
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
                  try {
                    await connector.activate(desiredChainId);
                    setEagerConnector(info.name);
                    setDialogOpen(false);
                  } catch (err) {
                    // NOOP - cancelled wallet connector
                  }
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
  const { isOpen, connectors, open, close, desiredChainId } =
    useWeb3ConnectStore();
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
