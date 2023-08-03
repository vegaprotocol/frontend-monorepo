import { create } from 'zustand';
import {
  Dialog,
  FormGroup,
  Input,
  Intent,
  Lozenge,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { t } from '@vegaprotocol/i18n';
import type { VegaConnector } from '../connectors';
import {
  InjectedConnector,
  JsonRpcConnector,
  RestConnector,
  ViewConnector,
} from '../connectors';
import { RestConnectorForm } from './rest-connector-form';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';
import type { Status as JsonRpcStatus } from '../use-json-rpc-connect';
import { useJsonRpcConnect } from '../use-json-rpc-connect';
import type { Status as InjectedStatus } from '../use-injected-connector';
import { useInjectedConnector } from '../use-injected-connector';
import { ViewConnectorForm } from './view-connector-form';
import { useChainIdQuery } from './__generated__/ChainId';
import { useVegaWallet } from '../use-vega-wallet';
import { InjectedConnectorForm } from './injected-connector-form';
import { isBrowserWalletInstalled } from '../utils';
import { useIsDesktopWalletRunning } from '../use-is-desktop-wallet-running';

export const CHROME_EXTENSION_URL =
  'https://chrome.google.com/webstore/detail/vega-wallet-fairground/nmmjkiafpmphlikhefgjbblebfgclikn';
export const MOZILLA_EXTENSION_URL =
  'https://addons.mozilla.org/pl/firefox/addon/vega-wallet/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search';
export const CLOSE_DELAY = 1700;
type Connectors = { [key: string]: VegaConnector };
export type WalletType = 'injected' | 'jsonRpc' | 'rest' | 'view';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  riskMessage?: React.ReactNode;
}

export interface VegaWalletDialogStore {
  vegaWalletDialogOpen: boolean;
  updateVegaWalletDialog: (open: boolean) => void;
  openVegaWalletDialog: () => void;
  closeVegaWalletDialog: () => void;
}

export const useVegaWalletDialogStore = create<VegaWalletDialogStore>()(
  (set) => ({
    vegaWalletDialogOpen: false,
    updateVegaWalletDialog: (open: boolean) =>
      set({ vegaWalletDialogOpen: open }),
    openVegaWalletDialog: () => set({ vegaWalletDialogOpen: true }),
    closeVegaWalletDialog: () => set({ vegaWalletDialogOpen: false }),
  })
);

export const VegaConnectDialog = ({
  connectors,
  riskMessage,
}: VegaConnectDialogProps) => {
  const { disconnect, acknowledgeNeeded } = useVegaWallet();
  const vegaWalletDialogOpen = useVegaWalletDialogStore(
    (store) => store.vegaWalletDialogOpen
  );
  const updateVegaWalletDialog = useVegaWalletDialogStore(
    (store) => (open: boolean) => {
      store.updateVegaWalletDialog(open);
    }
  );

  const onVegaWalletDialogChange = useCallback(
    (open: boolean) => {
      updateVegaWalletDialog(open);
      if (!open && acknowledgeNeeded) {
        disconnect();
      }
    },
    [updateVegaWalletDialog, acknowledgeNeeded, disconnect]
  );

  // Ensure we have a chain Id so we can compare with wallet chain id.
  // This value will already be in the cache, if it failed the app wont render
  const { data } = useChainIdQuery();

  return (
    <Dialog
      open={vegaWalletDialogOpen}
      size="small"
      onChange={onVegaWalletDialogChange}
    >
      {data && (
        <ConnectDialogContainer
          connectors={connectors}
          appChainId={data.statistics.chainId}
          riskMessage={riskMessage}
        />
      )}
    </Dialog>
  );
};

const ConnectDialogContainer = ({
  connectors,
  appChainId,
  riskMessage,
}: {
  connectors: Connectors;
  appChainId: string;
  riskMessage?: React.ReactNode;
}) => {
  const { VEGA_WALLET_URL, VEGA_ENV, HOSTED_WALLET_URL } = useEnvironment();
  const closeDialog = useVegaWalletDialogStore(
    (store) => store.closeVegaWalletDialog
  );
  const [selectedConnector, setSelectedConnector] = useState<VegaConnector>();
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL || '');

  const reset = useCallback(() => {
    setSelectedConnector(undefined);
  }, []);

  const delayedOnConnect = useCallback(() => {
    setTimeout(() => {
      closeDialog();
    }, CLOSE_DELAY);
  }, [closeDialog]);

  const { connect: jsonRpcConnect, ...jsonRpcState } =
    useJsonRpcConnect(delayedOnConnect);
  const { connect: injectedConnect, ...injectedState } =
    useInjectedConnector(delayedOnConnect);

  const handleSelect = (type: WalletType) => {
    const connector = connectors[type];

    // If type is rest user has selected the hosted wallet option. So here
    // we ensure that we are connecting to https://vega-hosted-wallet.on.fleek.co/
    // otherwise use walletUrl which defaults to the localhost:1789
    connector.url = type === 'rest' ? HOSTED_WALLET_URL : walletUrl;

    if (!connector) {
      // we should never get here unless connectors are not configured correctly
      throw new Error(`Connector type: ${type} not configured`);
    }

    setSelectedConnector(connector);

    // Immediately connect on selection if jsonRpc is selected, we can't do this
    // for rest because we need to show an authentication form
    if (connector instanceof JsonRpcConnector) {
      jsonRpcConnect(connector, appChainId);
    } else if (connector instanceof InjectedConnector) {
      injectedConnect(connector, appChainId);
    }
  };
  const isDesktopWalletRunning = useIsDesktopWalletRunning(
    walletUrl,
    connectors,
    appChainId
  );

  return (
    <>
      <ConnectDialogContent>
        {selectedConnector !== undefined ? (
          <SelectedForm
            connector={selectedConnector}
            jsonRpcState={jsonRpcState}
            injectedState={injectedState}
            onConnect={closeDialog}
            appChainId={appChainId}
            reset={reset}
            riskMessage={riskMessage}
          />
        ) : (
          <ConnectorList
            walletUrl={walletUrl}
            setWalletUrl={setWalletUrl}
            onSelect={handleSelect}
            isMainnet={VEGA_ENV === Networks.MAINNET}
            isDesktopWalletRunning={isDesktopWalletRunning}
          />
        )}
      </ConnectDialogContent>
      <ConnectDialogFooter connector={selectedConnector} />
    </>
  );
};

const ConnectorList = ({
  onSelect,
  walletUrl,
  setWalletUrl,
  isMainnet,
  isDesktopWalletRunning,
}: {
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isMainnet: boolean;
  isDesktopWalletRunning: boolean;
}) => {
  const title = isBrowserWalletInstalled()
    ? t('Connect Vega wallet')
    : t('Get a Vega wallet');
  return (
    <>
      <ConnectDialogTitle>{title}</ConnectDialogTitle>
      <p>
        {t(
          'Connect securely, deposit funds and approve or reject transactions with the Vega wallet'
        )}
      </p>
      <div data-testid="connectors-list" className="flex flex-col my-6 gap-2">
        <div className="last:mb-0">
          {isBrowserWalletInstalled() ? (
            <ConnectionOption
              type="injected"
              text={t('Connect')}
              onClick={() => onSelect('injected')}
            />
          ) : (
            <GetWallet />
          )}
        </div>
        <div className="text-center text-sm text-vega-clight-100 dare:text-vega-cdark-100">
          {t('OR')}
        </div>
        <div className="last:mb-0">
          <ConnectionOption
            disabled={!isDesktopWalletRunning}
            type="jsonRpc"
            text={t('Use the Desktop App/CLI')}
            onClick={() => onSelect('jsonRpc')}
          />
        </div>
        <CustomUrlInput
          walletUrl={walletUrl}
          setWalletUrl={setWalletUrl}
          isDesktopWalletRunning={isDesktopWalletRunning}
        />
      </div>
    </>
  );
};

const SelectedForm = ({
  connector,
  appChainId,
  jsonRpcState,
  injectedState,
  reset,
  onConnect,
  riskMessage,
}: {
  connector: VegaConnector;
  appChainId: string;
  jsonRpcState: {
    status: JsonRpcStatus;
    error: WalletClientError | null;
  };
  injectedState: {
    status: InjectedStatus;
    error: Error | null;
  };
  reset: () => void;
  onConnect: () => void;
  riskMessage?: React.ReactNode;
}) => {
  if (connector instanceof InjectedConnector) {
    return (
      <InjectedConnectorForm
        status={injectedState.status}
        error={injectedState.error}
        onConnect={onConnect}
        appChainId={appChainId}
        reset={reset}
        riskMessage={riskMessage}
      />
    );
  }

  if (connector instanceof RestConnector) {
    return (
      <>
        <button
          onClick={reset}
          className="absolute p-2 top-0 left-0 md:top-2 md:left-2"
          data-testid="back-button"
        >
          <VegaIcon name={VegaIconNames.CHEVRON_LEFT} />
        </button>
        <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
        <div className="mb-2">
          <RestConnectorForm connector={connector} onConnect={onConnect} />
        </div>
      </>
    );
  }

  if (connector instanceof JsonRpcConnector) {
    return (
      <JsonRpcConnectorForm
        connector={connector}
        status={jsonRpcState.status}
        error={jsonRpcState.error}
        onConnect={onConnect}
        appChainId={appChainId}
        reset={reset}
        riskMessage={riskMessage}
      />
    );
  }

  if (connector instanceof ViewConnector) {
    return (
      <ViewConnectorForm
        connector={connector}
        onConnect={onConnect}
        reset={reset}
      />
    );
  }

  throw new Error('No connector selected');
};

const GetWallet = () => {
  const isItChrome = window.navigator.userAgent.includes('Chrome');
  const isItMozilla =
    window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const onClick = () => {
    if (isItMozilla) {
      window.open(MOZILLA_EXTENSION_URL, '_blank');
      return;
    }
    window.open(CHROME_EXTENSION_URL, '_blank');
  };
  return (
    <TradingButton
      onClick={onClick}
      intent={Intent.Info}
      data-testid={`get-wallet-button}`}
      className="block w-full"
      size="small"
    >
      <span className="flex text-left justify-between items-center gap-1">
        {t('Get the Vega Wallet')}{' '}
        <Lozenge className="text-[10px] bg-vega-blue-500 dark:bg-vega-blue-500">
          ALPHA
        </Lozenge>
        <div className="place-self-end">
          {isItChrome && <ChromeIcon />}
          {isItMozilla && <MozillaLogo />}
        </div>
      </span>
    </TradingButton>
  );
};

const ConnectionOption = ({
  disabled,
  type,
  text,
  onClick,
  intent = Intent.Info,
}: {
  type: WalletType;
  text: string;
  onClick: () => void;
  disabled: boolean;
  intent: Intent;
}) => {
  return (
    <TradingButton
      size="small"
      intent={intent}
      onClick={onClick}
      className="block w-full"
      data-testid={`connector-${type}`}
      disabled={disabled}
    >
      <span className="flex text-left justify-between items-center">
        {text}
      </span>
    </TradingButton>
  );
};

const CustomUrlInput = ({
  walletUrl,
  setWalletUrl,
  isDesktopWalletRunning,
}: {
  walletUrl: string;
  setWalletUrl: (url: string) => void;
  isDesktopWalletRunning: boolean;
}) => {
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  return urlInputExpanded ? (
    <>
      <p className="mb-2">{t('Custom wallet location')}</p>
      <FormGroup
        labelFor="wallet-url"
        label={t('Custom wallet location')}
        hideLabel={true}
      >
        <Input
          value={walletUrl}
          onChange={(e) => setWalletUrl(e.target.value)}
          name="wallet-url"
        />
      </FormGroup>
      <p className="mb-2">{t('Choose wallet app to connect')}</p>
    </>
  ) : (
    <p className="mb-6 text-sm">
      {isDesktopWalletRunning ? (
        <button className="underline" onClick={() => setUrlInputExpanded(true)}>
          {t('Enter a custom wallet location')}
        </button>
      ) : (
        <>
          <span>
            {t(
              'No running Desktop App/CLI detected. Open your app now to connect or enter a'
            )}
          </span>{' '}
          <button
            className="underline"
            onClick={() => setUrlInputExpanded(true)}
          >
            {t('custom wallet location')}
          </button>
        </>
      )}
    </p>
  );
};

const ChromeIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#014595" />
      <g clip-path="url(#clip0_3681_24659)">
        <path
          d="M15.9987 9.99963L26.3893 9.99964C25.3364 8.17534 23.8217 6.6604 21.9976 5.60716C20.1735 4.55391 18.1042 3.99949 15.9979 3.99964C13.8915 3.99979 11.8223 4.5545 9.99837 5.608C8.1744 6.66149 6.65995 8.17664 5.6073 10.0011L10.8026 18.9996L10.8072 18.9984C10.2787 18.0871 9.99984 17.0525 9.99865 15.999C9.99747 14.9454 10.274 13.9102 10.8005 12.9977C11.3269 12.0851 12.0847 11.3275 12.9973 10.8011C13.9099 10.2748 14.9451 9.99832 15.9987 9.99963Z"
          fill="url(#paint0_linear_3681_24659)"
        />
        <path
          d="M21.1974 18.9989L16.0021 27.9974C18.1084 27.9977 20.1777 27.4435 22.0019 26.3904C23.8261 25.3373 25.3409 23.8224 26.3939 21.9982C27.447 20.174 28.0012 18.1047 28.0008 15.9983C28.0004 13.892 27.4455 11.8228 26.3918 9.99898L16.0012 9.99899L15.9999 10.0036C17.0534 10.0016 18.0889 10.2773 19.0018 10.8031C19.9148 11.3288 20.673 12.0859 21.2001 12.9981C21.7272 13.9103 22.0044 14.9454 22.004 15.9989C22.0035 17.0524 21.7253 18.0872 21.1974 18.9989Z"
          fill="url(#paint1_linear_3681_24659)"
        />
        <path
          d="M10.8044 19.0016L5.60914 10.0031C4.5557 11.8271 4.00106 13.8963 4.00098 16.0026C4.0009 18.109 4.55539 20.1782 5.60869 22.0023C6.66199 23.8264 8.17698 25.341 10.0013 26.3938C11.8257 27.4467 13.895 28.0007 16.0014 28.0001L21.1967 19.0015L21.1933 18.9981C20.6683 19.9115 19.9118 20.6703 19 21.1981C18.0882 21.7259 17.0534 22.004 15.9999 22.0043C14.9464 22.0047 13.9114 21.7273 12.9992 21.2001C12.0871 20.6729 11.3301 19.9146 10.8044 19.0016Z"
          fill="url(#paint2_linear_3681_24659)"
        />
        <path
          d="M16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22Z"
          fill="white"
        />
        <path
          d="M16 20.75C18.6234 20.75 20.75 18.6234 20.75 16C20.75 13.3766 18.6234 11.25 16 11.25C13.3766 11.25 11.25 13.3766 11.25 16C11.25 18.6234 13.3766 20.75 16 20.75Z"
          fill="#1A73E8"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_3681_24659"
          x1="25.093"
          y1="9.25084"
          x2="14.702"
          y2="27.2485"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#D93025" />
          <stop offset="1" stop-color="#EA4335" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3681_24659"
          x1="27.073"
          y1="11.4997"
          x2="6.29104"
          y2="11.4997"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FCC934" />
          <stop offset="1" stop-color="#FBBC04" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_3681_24659"
          x1="17.2992"
          y1="27.2508"
          x2="6.90819"
          y2="9.25305"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#1E8E3E" />
          <stop offset="1" stop-color="#34A853" />
        </linearGradient>
        <clipPath id="clip0_3681_24659">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(4 4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

const MozillaLogo = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_3681_24667)">
        <path
          d="M22.4398 7.79786C21.9502 6.62017 20.9585 5.34873 20.1798 4.94687C20.8136 6.1893 21.1804 7.43561 21.3205 8.36575C21.3205 8.36758 21.3212 8.37212 21.3227 8.3845C20.0489 5.20951 17.889 3.92926 16.1252 1.1417C16.0361 1.00075 15.9468 0.85942 15.8598 0.710452C15.8155 0.634372 15.7742 0.556628 15.7358 0.477389C15.6625 0.335913 15.606 0.186371 15.5674 0.0317953C15.5676 0.0244774 15.5652 0.017323 15.5604 0.0117374C15.5557 0.00615177 15.549 0.00253868 15.5418 0.00160783C15.5349 -0.000373182 15.5275 -0.000373182 15.5206 0.00160783C15.519 0.00217033 15.5167 0.00399845 15.515 0.0046547C15.5125 0.00563908 15.5094 0.00788908 15.5068 0.0093422C15.508 0.0076547 15.5107 0.00385783 15.5115 0.0029672C12.6816 1.66028 11.7216 4.72614 11.6334 6.26003C10.5034 6.33772 9.42293 6.75406 8.53298 7.45478C8.43981 7.37608 8.3424 7.30253 8.24119 7.23447C7.98442 6.33615 7.97351 5.38538 8.20959 4.4814C7.05234 5.00833 6.15225 5.84125 5.49787 6.57672H5.49267C5.04609 6.01108 5.07759 4.14517 5.10305 3.75559C5.0977 3.73145 4.76991 3.92575 4.72697 3.95505C4.3329 4.23633 3.96449 4.55194 3.62606 4.89817C3.24095 5.28871 2.88907 5.71069 2.57409 6.15972C2.57409 6.16028 2.57377 6.16094 2.57358 6.1615C2.57358 6.16089 2.57391 6.16028 2.57409 6.15972C1.8497 7.18625 1.33595 8.34618 1.06252 9.57245C1.05712 9.59687 1.05258 9.62219 1.04733 9.6468C1.02614 9.74598 0.949828 10.2421 0.936469 10.3499C0.935438 10.3582 0.934969 10.3662 0.933984 10.3745C0.835324 10.8874 0.774224 11.4069 0.751172 11.9287C0.751172 11.9479 0.75 11.967 0.75 11.9862C0.750187 18.2072 5.79394 23.2501 12.0154 23.2501C17.5872 23.2501 22.2135 19.2053 23.1192 13.8924C23.1383 13.7482 23.1536 13.6033 23.1704 13.4578C23.3943 11.5261 23.1456 9.49572 22.4398 7.79786ZM9.45562 16.6148C9.50831 16.6399 9.55781 16.6675 9.61191 16.6916C9.61416 16.6931 9.61725 16.6949 9.61955 16.6963C9.56449 16.67 9.50984 16.6428 9.45562 16.6148ZM21.3236 8.38726L21.3221 8.37634C21.3227 8.38033 21.3234 8.3845 21.324 8.38848L21.3236 8.38726Z"
          fill="url(#paint0_linear_3681_24667)"
        />
        <path
          d="M22.4397 7.79776C21.9501 6.62007 20.9584 5.34864 20.1797 4.94678C20.8135 6.1892 21.1803 7.43551 21.3204 8.36565C21.3204 8.36293 21.321 8.3679 21.3221 8.37625C21.3227 8.38023 21.3234 8.3844 21.324 8.38839C22.3869 11.2698 21.8078 14.1999 20.9734 15.9903C19.6825 18.7607 16.5571 21.5999 11.6652 21.4614C6.37978 21.3117 1.7235 17.39 0.854297 12.2536C0.695906 11.4436 0.854297 11.0323 0.933984 10.3746C0.836906 10.8816 0.799922 11.0281 0.751172 11.9289C0.751172 11.9481 0.75 11.9671 0.75 11.9864C0.750094 18.2071 5.79384 23.25 12.0153 23.25C17.5871 23.25 22.2134 19.2052 23.1191 13.8923C23.1382 13.7481 23.1535 13.6032 23.1703 13.4577C23.3942 11.526 23.1455 9.49562 22.4397 7.79776Z"
          fill="url(#paint1_radial_3681_24667)"
        />
        <path
          d="M22.4397 7.79776C21.9501 6.62007 20.9584 5.34864 20.1797 4.94678C20.8135 6.1892 21.1803 7.43551 21.3204 8.36565C21.3204 8.36293 21.321 8.3679 21.3221 8.37625C21.3227 8.38023 21.3234 8.3844 21.324 8.38839C22.3869 11.2698 21.8078 14.1999 20.9734 15.9903C19.6825 18.7607 16.5571 21.5999 11.6652 21.4614C6.37978 21.3117 1.7235 17.39 0.854297 12.2536C0.695906 11.4436 0.854297 11.0323 0.933984 10.3746C0.836906 10.8816 0.799922 11.0281 0.751172 11.9289C0.751172 11.9481 0.75 11.9671 0.75 11.9864C0.750094 18.2071 5.79384 23.25 12.0153 23.25C17.5871 23.25 22.2134 19.2052 23.1191 13.8923C23.1382 13.7481 23.1535 13.6032 23.1703 13.4577C23.3942 11.526 23.1455 9.49562 22.4397 7.79776Z"
          fill="url(#paint2_radial_3681_24667)"
        />
        <path
          d="M16.965 9.12184C16.9896 9.13909 17.0119 9.15625 17.035 9.1734C16.7523 8.67164 16.4002 8.21224 15.9892 7.80878C12.4874 4.3074 15.071 0.216811 15.5067 0.00906055C15.5079 0.00737305 15.5106 0.00357617 15.5114 0.00268555C12.6815 1.66 11.7215 4.72586 11.6333 6.25975C11.7646 6.25065 11.8954 6.23964 12.029 6.23964C14.1408 6.23964 15.9801 7.40073 16.965 9.12184Z"
          fill="url(#paint3_radial_3681_24667)"
        />
        <path
          d="M12.0361 9.82097C12.0176 10.1012 11.0276 11.0675 10.6814 11.0675C7.47799 11.0675 6.95801 13.0051 6.95801 13.0051C7.0999 14.6368 8.23587 15.9805 9.61165 16.6915C9.67441 16.7239 9.73793 16.7532 9.80149 16.7822C9.91047 16.8304 10.0208 16.8756 10.1324 16.9175C10.6041 17.0845 11.0982 17.1798 11.5982 17.2002C17.2129 17.4635 18.3007 10.488 14.2488 8.4623C15.2864 8.28183 16.3635 8.69916 16.965 9.12169C15.9801 7.40072 14.1408 6.23962 12.0291 6.23962C11.8955 6.23962 11.7647 6.25064 11.6334 6.25973C10.5033 6.33742 9.42291 6.75376 8.53296 7.45448C8.70471 7.5998 8.89859 7.79405 9.30705 8.19642C10.0712 8.94956 12.0319 9.72947 12.0361 9.82097Z"
          fill="url(#paint4_radial_3681_24667)"
        />
        <path
          d="M12.0361 9.82097C12.0176 10.1012 11.0276 11.0675 10.6814 11.0675C7.47799 11.0675 6.95801 13.0051 6.95801 13.0051C7.0999 14.6368 8.23587 15.9805 9.61165 16.6915C9.67441 16.7239 9.73793 16.7532 9.80149 16.7822C9.91047 16.8304 10.0208 16.8756 10.1324 16.9175C10.6041 17.0845 11.0982 17.1798 11.5982 17.2002C17.2129 17.4635 18.3007 10.488 14.2488 8.4623C15.2864 8.28183 16.3635 8.69916 16.965 9.12169C15.9801 7.40072 14.1408 6.23962 12.0291 6.23962C11.8955 6.23962 11.7647 6.25064 11.6334 6.25973C10.5033 6.33742 9.42291 6.75376 8.53296 7.45448C8.70471 7.5998 8.89859 7.79405 9.30705 8.19642C10.0712 8.94956 12.0319 9.72947 12.0361 9.82097Z"
          fill="url(#paint5_radial_3681_24667)"
        />
        <path
          d="M8.00739 7.07982C8.08584 7.13043 8.16368 7.18199 8.24087 7.23451C7.98411 6.33619 7.97319 5.38542 8.20928 4.48145C7.05203 5.00837 6.15193 5.84129 5.49756 6.57676C5.5517 6.57521 7.18571 6.54582 8.00739 7.07982Z"
          fill="url(#paint6_radial_3681_24667)"
        />
        <path
          d="M0.853976 12.2536C1.72318 17.3901 6.37946 21.3118 11.6649 21.4614C16.5568 21.5999 19.6822 18.7605 20.9731 15.9904C21.8075 14.1997 22.3866 11.2701 21.3237 8.38842L21.3233 8.3872L21.3218 8.37628C21.3206 8.36793 21.3199 8.36296 21.3201 8.36568C21.3201 8.36751 21.3208 8.37206 21.3223 8.38443C21.7219 10.9935 20.3947 13.5212 18.3199 15.2302L18.3137 15.2449C14.271 18.5366 10.4024 17.2309 9.61913 16.6964C9.56408 16.67 9.50939 16.6427 9.45507 16.6147C7.0981 15.4884 6.12441 13.3411 6.3332 11.4996C4.34302 11.4996 3.66441 9.82101 3.66441 9.82101C3.66441 9.82101 5.45124 8.54699 7.8062 9.65503C9.98729 10.6813 12.0356 9.8211 12.0359 9.82101C12.0317 9.72951 10.071 8.9496 9.30667 8.19651C8.89824 7.79414 8.70432 7.60012 8.53257 7.45457C8.4394 7.37587 8.34198 7.30232 8.24077 7.23426C8.16349 7.18188 8.08566 7.13031 8.00729 7.07957C7.18566 6.54557 5.5516 6.57496 5.49746 6.57637H5.49226C5.04568 6.01073 5.07718 4.14482 5.10263 3.75524C5.09729 3.7311 4.76949 3.9254 4.72655 3.9547C4.33248 4.23598 3.96408 4.55159 3.62565 4.89782C3.24052 5.28846 2.88865 5.71053 2.57368 6.15965C2.57368 6.16021 2.57335 6.16087 2.57316 6.16143C2.57316 6.16082 2.57349 6.16021 2.57368 6.15965C1.84929 7.18619 1.33553 8.34611 1.0621 9.57238C1.05671 9.59681 0.656632 11.3462 0.853976 12.2536Z"
          fill="url(#paint7_radial_3681_24667)"
        />
        <path
          d="M15.9894 7.80883C16.4004 8.21229 16.7525 8.67169 17.0352 9.17345C17.0972 9.22005 17.1552 9.2665 17.2043 9.31183C19.7582 11.665 18.4201 14.9931 18.3203 15.2303C20.395 13.5212 21.7222 10.9936 21.3227 8.38445C20.0489 5.20951 17.8889 3.92926 16.1251 1.1417C16.0361 1.00075 15.9468 0.85942 15.8598 0.710452C15.8155 0.634372 15.7741 0.556628 15.7357 0.477389C15.6625 0.335913 15.6059 0.186371 15.5673 0.0317953C15.5676 0.0244774 15.5651 0.017323 15.5604 0.0117374C15.5556 0.00615177 15.549 0.00253868 15.5417 0.00160783C15.5348 -0.000373182 15.5275 -0.000373182 15.5206 0.00160783C15.519 0.00217033 15.5166 0.00399845 15.515 0.0046547C15.5125 0.00563908 15.5093 0.00788908 15.5067 0.0093422C15.0712 0.216905 12.4876 4.3075 15.9894 7.80883Z"
          fill="url(#paint8_radial_3681_24667)"
        />
        <path
          d="M17.2043 9.31181C17.1551 9.26648 17.0972 9.22003 17.0352 9.17343C17.0123 9.15618 16.9898 9.13903 16.9652 9.12187C16.3637 8.69934 15.2866 8.28201 14.2489 8.46248C18.3008 10.4881 17.2131 17.4637 11.5984 17.2004C11.0984 17.18 10.6043 17.0847 10.1326 16.9177C10.021 16.8757 9.91066 16.8306 9.80166 16.7824C9.7381 16.7534 9.67458 16.7241 9.61182 16.6917C9.61407 16.6932 9.61716 16.6949 9.61946 16.6964C10.4027 17.2307 14.2713 18.5365 18.314 15.2448L18.3202 15.2302C18.42 14.9932 19.7581 11.665 17.2043 9.31181Z"
          fill="url(#paint9_radial_3681_24667)"
        />
        <path
          d="M6.95794 13.0051C6.95794 13.0051 7.47793 11.0675 10.6813 11.0675C11.0276 11.0675 12.0177 10.1012 12.036 9.82096C12.0543 9.54074 9.98756 10.6812 7.80633 9.65497C5.45138 8.54694 3.66455 9.82096 3.66455 9.82096C3.66455 9.82096 4.34316 11.4995 6.33333 11.4995C6.1246 13.341 7.09828 15.4886 9.45521 16.6147C9.50789 16.6399 9.55739 16.6674 9.61149 16.6915C8.2358 15.9805 7.09983 14.6368 6.95794 13.0051Z"
          fill="url(#paint10_radial_3681_24667)"
        />
        <path
          d="M22.4396 7.79786C21.95 6.62017 20.9583 5.34873 20.1796 4.94687C20.8134 6.1893 21.1802 7.43561 21.3203 8.36575C21.3203 8.36758 21.321 8.37212 21.3225 8.3845C20.0487 5.20951 17.8888 3.92926 16.125 1.1417C16.0359 1.00075 15.9466 0.85942 15.8596 0.710452C15.8153 0.634372 15.774 0.556628 15.7356 0.477389C15.6623 0.335913 15.6058 0.186371 15.5672 0.0317953C15.5675 0.0244774 15.565 0.017323 15.5602 0.0117374C15.5555 0.00615177 15.5489 0.00253868 15.5416 0.00160783C15.5347 -0.000373182 15.5274 -0.000373182 15.5205 0.00160783C15.5189 0.00217033 15.5165 0.00399845 15.5148 0.0046547C15.5123 0.00563908 15.5092 0.00788908 15.5066 0.0093422C15.5078 0.0076547 15.5105 0.00385783 15.5113 0.0029672C12.6814 1.66028 11.7214 4.72614 11.6332 6.26003C11.7645 6.25094 11.8953 6.23992 12.0289 6.23992C14.1408 6.23992 15.9801 7.40101 16.9649 9.12198C16.3634 8.69945 15.2863 8.28212 14.2486 8.46259C18.3005 10.4882 17.2127 17.4638 11.598 17.2005C11.098 17.1801 10.6039 17.0848 10.1322 16.9178C10.0207 16.8758 9.91032 16.8307 9.80133 16.7825C9.73777 16.7535 9.67425 16.7242 9.61148 16.6918C9.61373 16.6933 9.61683 16.6951 9.61912 16.6965C9.56407 16.67 9.50938 16.6427 9.45506 16.6148C9.50775 16.6399 9.55725 16.6675 9.61134 16.6916C8.23556 15.9806 7.09959 14.6369 6.9577 13.0052C6.9577 13.0052 7.47769 11.0676 10.6811 11.0676C11.0274 11.0676 12.0174 10.1013 12.0358 9.82108C12.0316 9.72958 10.0709 8.94967 9.30656 8.19658C8.89814 7.7942 8.70422 7.60019 8.53247 7.45464C8.43929 7.37594 8.34188 7.30239 8.24067 7.23433C7.98391 6.33601 7.97299 5.38524 8.20908 4.48126C7.05183 5.00819 6.15173 5.84111 5.49736 6.57658H5.49216C5.04558 6.01094 5.07708 4.14503 5.10253 3.75545C5.09719 3.73131 4.76939 3.92561 4.72645 3.9549C4.33238 4.23619 3.96398 4.5518 3.62555 4.89803C3.24054 5.28863 2.88878 5.71066 2.57391 6.15972C2.57391 6.16028 2.57358 6.16094 2.57339 6.1615C2.57339 6.16089 2.57372 6.16028 2.57391 6.15972C1.84952 7.18625 1.33576 8.34618 1.06233 9.57245C1.05694 9.59687 1.05239 9.62219 1.04714 9.6468C1.02595 9.74598 0.930609 10.2493 0.917297 10.3572C0.916266 10.3655 0.918281 10.349 0.917297 10.3572C0.830351 10.8773 0.774875 11.4022 0.751172 11.929C0.751172 11.9482 0.75 11.9672 0.75 11.9865C0.75 18.2072 5.79375 23.2501 12.0152 23.2501C17.587 23.2501 22.2133 19.2053 23.119 13.8924C23.1381 13.7482 23.1534 13.6033 23.1702 13.4578C23.3941 11.5261 23.1454 9.49572 22.4396 7.79786ZM21.322 8.37634C21.3226 8.38033 21.3233 8.3845 21.3239 8.38848L21.3235 8.38726L21.322 8.37634Z"
          fill="url(#paint11_linear_3681_24667)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_3681_24667"
          x1="20.3814"
          y1="3.60386"
          x2="2.29295"
          y2="21.0528"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.05" stop-color="#FFF44F" />
          <stop offset="0.37" stop-color="#FF980E" />
          <stop offset="0.53" stop-color="#FF3647" />
          <stop offset="0.7" stop-color="#E31587" />
        </linearGradient>
        <radialGradient
          id="paint1_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16.3404 2.59171) scale(23.0401 23.4281)"
        >
          <stop offset="0.13" stop-color="#FFBD4F" />
          <stop offset="0.28" stop-color="#FF980E" />
          <stop offset="0.47" stop-color="#FF3750" />
          <stop offset="0.78" stop-color="#EB0878" />
          <stop offset="0.86" stop-color="#E50080" />
        </radialGradient>
        <radialGradient
          id="paint2_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(9.65968 12.2681) scale(23.6161 23.4281)"
        >
          <stop offset="0.3" stop-color="#960E18" />
          <stop offset="0.35" stop-color="#B11927" stop-opacity="0.74" />
          <stop offset="0.43" stop-color="#DB293D" stop-opacity="0.34" />
          <stop offset="0.5" stop-color="#F5334B" stop-opacity="0.09" />
          <stop offset="0.53" stop-color="#FF3750" stop-opacity="0" />
        </radialGradient>
        <radialGradient
          id="paint3_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(14.2261 -1.0978) scale(7.56236 12.839)"
        >
          <stop offset="0.13" stop-color="#FFF44F" />
          <stop offset="0.53" stop-color="#FF980E" />
        </radialGradient>
        <radialGradient
          id="paint4_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(9.2356 18.3163) scale(10.007 10.9678)"
        >
          <stop offset="0.35" stop-color="#3A8EE6" />
          <stop offset="0.67" stop-color="#9059FF" />
          <stop offset="1" stop-color="#C139E6" />
        </radialGradient>
        <radialGradient
          id="paint5_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(10.9455 9.859) scale(5.31373 6.47101)"
        >
          <stop offset="0.21" stop-color="#9059FF" stop-opacity="0" />
          <stop offset="0.97" stop-color="#6E008B" stop-opacity="0.6" />
        </radialGradient>
        <radialGradient
          id="paint6_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(11.2585 1.72838) scale(7.95561 7.98388)"
        >
          <stop offset="0.1" stop-color="#FFE226" />
          <stop offset="0.79" stop-color="#FF7139" />
        </radialGradient>
        <radialGradient
          id="paint7_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(18.5242 -3.50921) scale(37.9818 31.8836)"
        >
          <stop offset="0.11" stop-color="#FFF44F" />
          <stop offset="0.46" stop-color="#FF980E" />
          <stop offset="0.72" stop-color="#FF3647" />
          <stop offset="0.9" stop-color="#E31587" />
        </radialGradient>
        <radialGradient
          id="paint8_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(4.41888 7.02007) rotate(77.3946) scale(12.0503 52.1278)"
        >
          <stop stop-color="#FFF44F" />
          <stop offset="0.3" stop-color="#FF980E" />
          <stop offset="0.57" stop-color="#FF3647" />
          <stop offset="0.74" stop-color="#E31587" />
        </radialGradient>
        <radialGradient
          id="paint9_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(11.3407 4.60001) scale(21.8071 21.424)"
        >
          <stop offset="0.14" stop-color="#FFF44F" />
          <stop offset="0.48" stop-color="#FF980E" />
          <stop offset="0.66" stop-color="#FF3647" />
          <stop offset="0.9" stop-color="#E31587" />
        </radialGradient>
        <radialGradient
          id="paint10_radial_3681_24667"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(17.0005 5.8529) scale(26.2114 23.4492)"
        >
          <stop offset="0.09" stop-color="#FFF44F" />
          <stop offset="0.63" stop-color="#FF980E" />
        </radialGradient>
        <linearGradient
          id="paint11_linear_3681_24667"
          x1="18.75"
          y1="3.25511"
          x2="4.28552"
          y2="19.0592"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.17" stop-color="#FFF44F" stop-opacity="0.8" />
          <stop offset="0.6" stop-color="#FFF44F" stop-opacity="0" />
        </linearGradient>
        <clipPath id="clip0_3681_24667">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
