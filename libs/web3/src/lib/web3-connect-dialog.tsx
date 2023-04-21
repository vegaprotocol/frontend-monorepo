import { t } from '@vegaprotocol/i18n';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
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
}: Web3ConnectDialogProps) => (
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

const ConnectButton = ({
  connector,
  desiredChainId,
  onClick,
}: {
  connector: [Connector, Web3ReactHooks];
  desiredChainId?: number;
  onClick?: () => void;
}) => {
  const [connectorInstance, { useIsActivating }] = connector;
  const isActivating = useIsActivating();
  const info = getConnectorInfo(connectorInstance);
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
          console.log('could not connect to the wallet', info.name, err);
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

function getConnectorInfo(connector: Connector) {
  if (connector instanceof MetaMask) {
    return {
      icon: <MetaMaskIcon width={40} />,
      name: 'MetaMask',
      text: t('MetaMask'),
      alt: t('MetaMask, Brave or other injected web wallet'),
    };
  }
  if (connector instanceof CoinbaseWallet) {
    return {
      icon: <CoinbaseWalletIcon width={40} />,
      name: 'CoinbaseWallet',
      text: t('Coinbase'),
    };
  }
  if (connector instanceof WalletConnect) {
    return {
      icon: <WalletConnectIcon width={40} />,
      name: 'WalletConnect',
      text: t('WalletConnect'),
      alt: t('WalletConnect v2'),
    };
  }
  if (connector instanceof WalletConnectLegacy) {
    return {
      icon: (
        <WalletConnectIcon
          width={40}
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

const MetaMaskIcon = ({ width, height }: IconProps) => (
  <svg
    viewBox="0 0 47 47"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
  >
    <g>
      <path
        d="m40.632 6.969-14.136 10.62 2.628-6.259L40.632 6.97Z"
        fill="#E17726"
        stroke="#E17726"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m8.024 6.969 14.01 10.72-2.502-6.359L8.024 6.97ZM35.542 31.594l-3.761 5.834 8.054 2.251 2.307-7.958-6.6-.127ZM6.528 31.721 8.82 39.68l8.04-2.251-3.747-5.834-6.586.127Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m16.428 21.738-2.237 3.427 7.97.368-.266-8.709-5.467 4.914ZM32.229 21.738l-5.552-5.012-.181 8.807 7.97-.368-2.237-3.427ZM16.861 37.428l4.824-2.365-4.152-3.285-.672 5.65ZM26.971 35.063l4.81 2.365-.657-5.65-4.153 3.285Z"
        fill="#E27625"
        stroke="#E27625"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m31.78 37.428-4.81-2.365.392 3.172-.042 1.345 4.46-2.152ZM16.861 37.428l4.475 2.152-.028-1.345.377-3.172-4.824 2.365Z"
        fill="#D5BFB2"
        stroke="#D5BFB2"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m21.42 29.682-4-1.19 2.825-1.316 1.174 2.506ZM27.236 29.682l1.175-2.506 2.838 1.317-4.013 1.19Z"
        fill="#233447"
        stroke="#233447"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m16.861 37.427.7-5.834-4.447.128 3.747 5.706ZM31.096 31.593l.685 5.834 3.761-5.706-4.446-.128ZM34.465 25.165l-7.97.368.741 4.15 1.175-2.507 2.838 1.317 3.216-3.328ZM17.42 28.493l2.825-1.317 1.175 2.506.74-4.149-7.97-.368 3.23 3.328Z"
        fill="#CC6228"
        stroke="#CC6228"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m14.19 25.165 3.343 6.613-.112-3.285-3.23-3.328ZM31.25 28.493l-.126 3.285 3.342-6.613-3.216 3.328ZM22.161 25.533l-.741 4.149.937 4.9.21-6.458-.406-2.591ZM26.495 25.533l-.391 2.577.196 6.471.937-4.9-.741-4.148Z"
        fill="#E27525"
        stroke="#E27525"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m27.237 29.682-.937 4.9.671.481 4.153-3.285.126-3.285-4.013 1.19ZM17.42 28.493l.112 3.285 4.153 3.285.671-.481-.937-4.9-3.999-1.19Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m27.32 39.58.042-1.345-.363-.312h-5.342l-.35.312.029 1.345-4.475-2.152 1.566 1.303 3.175 2.223h5.439l3.188-2.224 1.552-1.302-4.46 2.152Z"
        fill="#C0AC9D"
        stroke="#C0AC9D"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m26.97 35.063-.67-.482h-3.944l-.67.482-.378 3.172.35-.312h5.34l.364.312-.391-3.172Z"
        fill="#161616"
        stroke="#161616"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m41.234 18.283 1.188-5.863-1.79-5.451-13.66 10.266 5.257 4.503 7.425 2.195 1.636-1.94-.713-.524 1.132-1.048-.867-.68 1.133-.878-.741-.58ZM6.234 12.42l1.203 5.863-.77.58 1.147.878-.867.68L8.08 21.47l-.713.524 1.636 1.94 7.425-2.195 5.257-4.503L8.025 6.97l-1.79 5.452Z"
        fill="#763E1A"
        stroke="#763E1A"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="m39.654 23.933-7.425-2.195 2.237 3.427-3.342 6.613 4.419-.057h6.6l-2.49-7.788ZM16.428 21.738l-7.425 2.195-2.475 7.788h6.586l4.418.056-3.342-6.612 2.238-3.427ZM26.495 25.533l.476-8.298 2.153-5.905h-9.592l2.153 5.905.476 8.298.181 2.605.014 6.443H26.3l.014-6.443.182-2.605Z"
        fill="#F5841F"
        stroke="#F5841F"
        strokeWidth="0.223"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </g>
  </svg>
);

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
