import classNames from 'classnames';
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
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { t } from '@vegaprotocol/i18n';
import type { VegaConnector } from '../connectors';
import {
  InjectedConnector,
  JsonRpcConnector,
  ViewConnector,
} from '../connectors';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
  BrowserIcon,
  CHROME_EXTENSION_URL,
  MOZILLA_EXTENSION_URL,
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

export const CLOSE_DELAY = 1700;
type Connectors = { [key: string]: VegaConnector };
export type WalletType = 'injected' | 'jsonRpc' | 'view';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  riskMessage?: ReactNode;
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
  riskMessage?: ReactNode;
}) => {
  const { VEGA_WALLET_URL } = useEnvironment();
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
    connector.url = walletUrl;

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
            isDesktopWalletRunning={isDesktopWalletRunning}
          />
        )}
      </ConnectDialogContent>
      <ConnectDialogFooter />
    </>
  );
};

const ConnectorList = ({
  onSelect,
  walletUrl,
  setWalletUrl,
  isDesktopWalletRunning,
}: {
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isDesktopWalletRunning: boolean;
}) => {
  const title = isBrowserWalletInstalled()
    ? t('Connect Vega wallet')
    : t('Get a Vega wallet');

  const extendedText = (
    <>
      <div className="w-full h-full flex justify-center items-center gap-1 text-base">
        {t('Connect')}
      </div>
      <BrowserIcon />
    </>
  );

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
              text={extendedText}
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
          <CustomUrlInput
            walletUrl={walletUrl}
            setWalletUrl={setWalletUrl}
            isDesktopWalletRunning={isDesktopWalletRunning}
            onSelect={() => onSelect('jsonRpc')}
          />
        </div>
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
  riskMessage?: ReactNode;
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
    if (isItChrome) {
      window.open(CHROME_EXTENSION_URL, '_blank');
    }
  };

  const buttonContent = (
    <>
      <div className="flex items-center justify-center gap-1 text-base">
        {t('Get the Vega Wallet')}
        <Lozenge className="text-[10px] !font-alpha bg-vega-blue-500 dark:bg-vega-blue-500 py-0 px-1">
          ALPHA
        </Lozenge>
      </div>
      <BrowserIcon />
    </>
  );

  return !isItChrome && !isItMozilla ? (
    <div
      className={classNames([
        'bg-vega-blue-350 hover:bg-vega-blue-400 dark:bg-vega-blue-650 dark:hover:bg-vega-blue-600',
        'flex gap-2 items-center justify-center rounded h-8 px-3 relative',
      ])}
      data-testid="get-wallet-button"
    >
      {buttonContent}
    </div>
  ) : (
    <TradingButton
      onClick={onClick}
      intent={Intent.Info}
      data-testid="get-wallet-button"
      className="!block w-full relative"
      size="small"
    >
      {buttonContent}
    </TradingButton>
  );
};

const ConnectionOption = ({
  disabled,
  type,
  text,
  onClick,
  icon,
}: {
  type: WalletType;
  text: string | ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) => {
  return (
    <TradingButton
      size="small"
      intent={Intent.Info}
      onClick={onClick}
      className="!block w-full relative"
      data-testid={`connector-${type}`}
      disabled={disabled}
      icon={icon}
    >
      <span className="flex justify-center items-center text-base">{text}</span>
    </TradingButton>
  );
};

const CustomUrlInput = ({
  walletUrl,
  setWalletUrl,
  isDesktopWalletRunning,
  onSelect,
}: {
  walletUrl: string;
  setWalletUrl: (url: string) => void;
  isDesktopWalletRunning: boolean;
  onSelect: (type: WalletType) => void;
}) => {
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  return urlInputExpanded ? (
    <>
      <div className="flex justify-between mb-1.5">
        <p className="text-sm text-vega-clight-100 dark:text-vega-cdark-100">
          {t('Custom wallet location')}
        </p>
        <button
          className="text-sm underline"
          onClick={() => setUrlInputExpanded(false)}
        >
          <VegaIcon name={VegaIconNames.ARROW_LEFT} /> {t('Go back')}
        </button>
      </div>
      <FormGroup
        labelFor="wallet-url"
        label={t('Custom wallet location')}
        hideLabel
      >
        <Input
          value={walletUrl}
          onChange={(e) => setWalletUrl(e.target.value)}
          name="wallet-url"
        />
      </FormGroup>
      <ConnectionOption
        disabled={!isDesktopWalletRunning}
        type="jsonRpc"
        text={t('Connect the App/CLI')}
        onClick={() => onSelect('jsonRpc')}
      />
    </>
  ) : (
    <>
      <ConnectionOption
        disabled={!isDesktopWalletRunning}
        type="jsonRpc"
        text={t('Use the Desktop App/CLI')}
        onClick={() => onSelect('jsonRpc')}
      />
      <p className="mb-6 text-sm pt-2">
        {isDesktopWalletRunning ? (
          <button
            className="underline text-default"
            onClick={() => setUrlInputExpanded(true)}
          >
            {t('Enter a custom wallet location')}{' '}
            <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
          </button>
        ) : (
          <>
            <span className="text-default">
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
    </>
  );
};
