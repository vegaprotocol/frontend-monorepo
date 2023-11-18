import { useLocalStorage } from '@vegaprotocol/react-helpers';
import {
  Dialog,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { WalletConnect as WalletConnectLegacy } from '@web3-react/walletconnect';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import type { Connector } from '@web3-react/types';
import { ETHEREUM_EAGER_CONNECT } from './use-eager-connect';
import type { Web3ReactHooks } from '@web3-react/core';
import { useWeb3ConnectStore } from './web3-connect-store';
import { theme } from '@vegaprotocol/tailwindcss-config';
import classNames from 'classnames';
import { useT } from './use-t';

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
  const t = useT();
  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      onInteractOutside={(e) => {
        // do not close dialog when clicked outside (wallet connect modal)
        e.preventDefault();
      }}
      intent={Intent.None}
      title={t('Connect to your Ethereum wallet')}
      size="small"
    >
      <ul className="grid grid-cols-2 gap-2" data-testid="web3-connector-list">
        {connectors.map((connector, i) => (
          <li key={i} className="mb-2 last:mb-0">
            <ConnectButton
              connector={connector}
              desiredChainId={desiredChainId}
              onClick={() => {
                setDialogOpen(false);
              }}
            />
          </li>
        ))}
      </ul>
    </Dialog>
  );
};

const ConnectButton = ({
  connector,
  desiredChainId,
  onClick,
}: {
  connector: [Connector, Web3ReactHooks];
  desiredChainId?: number;
  onClick?: () => void;
}) => {
  const t = useT();
  const [connectorInstance, { useIsActivating }] = connector;
  const isActivating = useIsActivating();
  const info = getConnectorInfo(connectorInstance, t);
  const [, setEagerConnector] = useLocalStorage(ETHEREUM_EAGER_CONNECT);
  return (
    <button
      className={classNames(
        'flex items-center gap-2 p-2 rounded ',
        'hover:bg-vega-light-100 hover:dark:bg-vega-dark-100',
        {
          '!bg-vega-yellow text-black hover:active:!bg-vega-yellow':
            isActivating,
        }
      )}
      data-testid={`web3-connector-${info.name}`}
      title={info.alt}
      onClick={async () => {
        // remove orphaned wallet connect modals
        const modals = document.querySelectorAll('w3m-modal');
        if (modals.length > 0) {
          modals.forEach((m) => m.remove());
        }

        try {
          await connectorInstance.activate(desiredChainId);
          setEagerConnector(info.name);
          onClick?.();
        } catch (err) {
          console.warn('could not connect to the wallet', info.name, err);
          // NOOP - cancelled wallet connector
        }
      }}
    >
      {info.icon}
      <span>{info.text}</span>
    </button>
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

function getConnectorInfo(connector: Connector, t: ReturnType<typeof useT>) {
  if (connector instanceof MetaMask) {
    return {
      icon: <VegaIcon name={VegaIconNames.METAMASK} size={32} />,
      name: 'MetaMask',
      text: t('MetaMask'),
      alt: t('MetaMask, Brave or other injected web wallet'),
    };
  }
  if (connector instanceof CoinbaseWallet) {
    return {
      icon: <CoinbaseWalletIcon width={32} />,
      name: 'CoinbaseWallet',
      text: t('Coinbase'),
    };
  }
  if (connector instanceof WalletConnect) {
    return {
      icon: <WalletConnectIcon width={32} />,
      name: 'WalletConnect',
      text: t('WalletConnect'),
      alt: t('WalletConnect v2'),
    };
  }
  if (connector instanceof WalletConnectLegacy) {
    return {
      icon: (
        <WalletConnectIcon
          width={32}
          fillColor={theme.colors.vega.light[200]}
        />
      ),
      name: 'WalletConnectLegacy',
      text: t('WalletConnect Legacy'),
      alt: t('WalletConnect v1'),
    };
  }
  return { name: 'Unknown', text: t('Unknown') };
}

type IconProps = {
  width?: number;
  height?: number;
};

const CoinbaseWalletIcon = ({ width, height }: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 1024 1024"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="1024" height="1024" fill="#0052FF" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z"
      fill="white"
    />
  </svg>
);

const WalletConnectIcon = ({
  width,
  height,
  fillColor = '#3396ff',
}: IconProps & { fillColor?: string }) => (
  <svg
    fill="none"
    width={width}
    height={height}
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <circle cx="200" cy="200" fill={fillColor} r="199.5" stroke="none" />
      <path
        d="m122.519 148.965c42.791-41.729 112.171-41.729 154.962 0l5.15 5.022c2.14 2.086 2.14 5.469 0 7.555l-17.617 17.18c-1.07 1.043-2.804 1.043-3.874 0l-7.087-6.911c-29.853-29.111-78.253-29.111-108.106 0l-7.59 7.401c-1.07 1.043-2.804 1.043-3.874 0l-17.617-17.18c-2.14-2.086-2.14-5.469 0-7.555zm191.397 35.529 15.679 15.29c2.14 2.086 2.14 5.469 0 7.555l-70.7 68.944c-2.139 2.087-5.608 2.087-7.748 0l-50.178-48.931c-.535-.522-1.402-.522-1.937 0l-50.178 48.931c-2.139 2.087-5.608 2.087-7.748 0l-70.7015-68.945c-2.1396-2.086-2.1396-5.469 0-7.555l15.6795-15.29c2.1396-2.086 5.6085-2.086 7.7481 0l50.1789 48.932c.535.522 1.402.522 1.937 0l50.177-48.932c2.139-2.087 5.608-2.087 7.748 0l50.179 48.932c.535.522 1.402.522 1.937 0l50.179-48.931c2.139-2.087 5.608-2.087 7.748 0z"
        fill="#fff"
      />
    </g>
  </svg>
);
