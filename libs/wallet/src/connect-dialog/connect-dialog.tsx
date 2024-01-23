import classNames from 'classnames';
import {
  Dialog,
  ExternalLink,
  Intent,
  Pill,
  TradingButton,
  TradingFormGroup,
  TradingInput,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState, type ReactNode } from 'react';
import { type WalletClientError } from '@vegaprotocol/wallet-client';
import { type Connectors, type VegaConnector } from '../connectors';
import { DEFAULT_SNAP_VERSION } from '../connectors';
import {
  DEFAULT_SNAP_ID,
  InjectedConnector,
  JsonRpcConnector,
  SnapConnector,
  ViewConnector,
  requestSnap,
} from '../connectors';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { ViewConnectorForm } from './view-connector-form';
import {
  BrowserIcon,
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';
import {
  useJsonRpcConnect,
  type Status as JsonRpcStatus,
} from '../use-json-rpc-connect';
import {
  useInjectedConnector,
  type Status as InjectedStatus,
} from '../use-injected-connector';
import { useVegaWallet } from '../use-vega-wallet';
import { InjectedConnectorForm } from './injected-connector-form';
import { isBrowserWalletInstalled } from '../utils';
import { useIsWalletServiceRunning } from '../use-is-wallet-service-running';
import { SnapStatus, useSnapStatus } from '../use-snap-status';
import { useVegaWalletDialogStore } from './vega-wallet-dialog-store';
import { useChainId } from './use-chain-id';
import { useT } from '../use-t';
import { Trans } from 'react-i18next';

export const CLOSE_DELAY = 1700;

export type WalletType = 'injected' | 'jsonRpc' | 'view' | 'snap';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  riskMessage?: ReactNode;
  contentOnly?: boolean;
  onClose?: () => void;
}

export const VegaConnectDialog = ({
  connectors,
  riskMessage,
  contentOnly,
  onClose,
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
  const chainId = useChainId();

  const content = chainId && (
    <ConnectDialogContainer
      connectors={connectors}
      appChainId={chainId}
      riskMessage={riskMessage}
      onClose={onClose}
    />
  );
  if (contentOnly) {
    return content;
  }
  return (
    <Dialog
      open={vegaWalletDialogOpen}
      size="small"
      onChange={onVegaWalletDialogChange}
    >
      {content}
    </Dialog>
  );
};

const ConnectDialogContainer = ({
  connectors,
  appChainId,
  riskMessage,
  onClose,
}: {
  connectors: Connectors;
  appChainId: string;
  riskMessage?: ReactNode;
  onClose?: () => void;
}) => {
  const { vegaUrl, vegaWalletServiceUrl } = useVegaWallet();
  const closeVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.closeVegaWalletDialog
  );
  const closeDialog = useCallback(() => {
    onClose ? onClose() : closeVegaWalletDialog();
  }, [closeVegaWalletDialog, onClose]);
  const [selectedConnector, setSelectedConnector] = useState<VegaConnector>();
  const [walletUrl, setWalletUrl] = useState(vegaWalletServiceUrl);

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

    if (!connector) {
      // we should never get here unless connectors are not configured correctly
      throw new Error(`Connector type: ${type} not configured`);
    }

    setSelectedConnector(connector);

    // Immediately connect on selection if jsonRpc is selected, we can't do this
    // for rest because we need to show an authentication form
    if (connector instanceof JsonRpcConnector) {
      connector.url = walletUrl;
      jsonRpcConnect(connector, appChainId);
    } else if (connector instanceof InjectedConnector) {
      injectedConnect(connector, appChainId);
    } else if (connector instanceof SnapConnector) {
      // Set the nodeAddress to send tx's to, normally this is handled by
      // the vega wallet
      connector.nodeAddress = new URL(vegaUrl).origin;
      injectedConnect(connector, appChainId);
    }
  };

  const isDesktopWalletRunning = useIsWalletServiceRunning(
    walletUrl,
    connectors['jsonRpc']
  );

  const snapStatus = useSnapStatus(
    DEFAULT_SNAP_ID,
    Boolean(connectors['snap'])
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
            connectors={connectors}
            walletUrl={walletUrl}
            setWalletUrl={setWalletUrl}
            onSelect={handleSelect}
            isDesktopWalletRunning={isDesktopWalletRunning}
            snapStatus={snapStatus}
          />
        )}
      </ConnectDialogContent>
      <ConnectDialogFooter />
    </>
  );
};

const ConnectorList = ({
  connectors,
  onSelect,
  walletUrl,
  setWalletUrl,
  isDesktopWalletRunning,
  snapStatus,
}: {
  connectors: Connectors;
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isDesktopWalletRunning: boolean | null;
  snapStatus: SnapStatus;
}) => {
  const t = useT();
  const { pubKey, links } = useVegaWallet();
  const title = isBrowserWalletInstalled()
    ? t('Connect Vega wallet')
    : t('Get a Vega wallet');

  const extendedText = (
    <>
      <div className="flex h-full w-full items-center justify-center gap-1 text-base">
        {t('Connect')}
      </div>
      <BrowserIcon
        chromeExtensionUrl={links.chromeExtensionUrl}
        mozillaExtensionUrl={links.mozillaExtensionUrl}
      />
    </>
  );
  const isItChrome = window.navigator.userAgent.includes('Chrome');
  const isItMozilla =
    window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const browserName = isItChrome
    ? 'Chrome'
    : isItMozilla
    ? 'Firefox'
    : t('your browser');

  return (
    <>
      <ConnectDialogTitle>{title}</ConnectDialogTitle>
      <p className="text-md">
        {t(
          'Connect securely, deposit funds and approve or reject transactions with the Vega wallet'
        )}
      </p>
      <div data-testid="connectors-list" className="mt-4 flex flex-col gap-2">
        {isBrowserWalletInstalled() ? (
          <ConnectionOptionWithDescription
            type="injected"
            text={extendedText}
            onClick={() => onSelect('injected')}
            title={
              <Trans
                defaults="Vega Wallet <0>full featured</0>"
                components={[<span className="text-xs">full featured</span>]}
              />
            }
            description={t(
              'Connect with Vega Wallet extension for {{browserName}} to access all features including key management and detailed transaction views from your browser.',
              { browserName }
            )}
          />
        ) : (
          <div>
            <h1 className="mb-1 text-lg">
              <Trans
                defaults="Vega Wallet <0>full featured</0>"
                components={[<span className="text-xs">full featured</span>]}
              />
            </h1>
            <p className="mb-2 text-sm">
              {t(
                'Install Vega Wallet extension for {{browserName}} to access all features including key management and detailed transaction views from your browser.',
                { browserName }
              )}
            </p>
            <GetWalletButton
              chromeExtensionUrl={links.chromeExtensionUrl}
              mozillaExtensionUrl={links.mozillaExtensionUrl}
            />
          </div>
        )}
        {connectors['snap'] !== undefined ? (
          <div>
            {snapStatus === SnapStatus.INSTALLED ? (
              <ConnectionOptionWithDescription
                type="snap"
                title={
                  <Trans
                    defaults="Metamask Snap <0>quick start</0>"
                    components={[<span className="text-xs">quick start</span>]}
                  />
                }
                description={t(
                  `Connect directly via Metamask with the Vega Snap for single key support without advanced features.`
                )}
                text={
                  <>
                    <div className="flex h-full w-full items-center justify-center gap-1 text-base">
                      {t('Connect via Vega MetaMask Snap')}
                    </div>
                    <div className="absolute right-1 top-0 flex h-8 items-center">
                      <VegaIcon name={VegaIconNames.METAMASK} size={24} />
                    </div>
                  </>
                }
                onClick={() => {
                  onSelect('snap');
                }}
              />
            ) : (
              <>
                <ConnectionOptionWithDescription
                  type="snap"
                  disabled={snapStatus === SnapStatus.NOT_SUPPORTED}
                  title={
                    <Trans
                      defaults="Metamask Snap <0>quick start</0>"
                      components={[
                        <span className="text-xs">quick start</span>,
                      ]}
                    />
                  }
                  description={t(
                    `Install Metamask with the Vega Snap for single key support without advanced features.`
                  )}
                  text={
                    <>
                      <div className="flex h-full w-full items-center justify-center gap-1 text-base">
                        {t('Install Vega MetaMask Snap')}
                      </div>
                      <div className="absolute right-1 top-0 flex h-8 items-center">
                        <VegaIcon name={VegaIconNames.METAMASK} size={24} />
                      </div>
                    </>
                  }
                  onClick={() => {
                    requestSnap(DEFAULT_SNAP_ID, {
                      version: DEFAULT_SNAP_VERSION,
                    });
                  }}
                />
                {snapStatus === SnapStatus.NOT_SUPPORTED ? (
                  <p className="text-muted pt-1 text-xs leading-tight">
                    <Trans
                      defaults="No MetaMask version that supports snaps detected. Learn more about <0>MetaMask Snaps</0>"
                      components={[
                        <ExternalLink href="https://metamask.io/snaps/">
                          MetaMask Snaps
                        </ExternalLink>,
                      ]}
                    />
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
        <div>
          <h1 className="text-md mb-1">{t('Advanced / Other options...')}</h1>
          <ConnectionOption
            type="view"
            text={t('View as party')}
            onClick={() => onSelect('view')}
            disabled={Boolean(pubKey)}
          />
          <div className="mt-2">
            <CustomUrlInput
              walletUrl={walletUrl}
              setWalletUrl={setWalletUrl}
              isDesktopWalletRunning={isDesktopWalletRunning}
              onSelect={() => onSelect('jsonRpc')}
            />
          </div>
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
  if (
    connector instanceof InjectedConnector ||
    connector instanceof SnapConnector
  ) {
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

export const GetWalletButton = ({
  chromeExtensionUrl,
  mozillaExtensionUrl,
  className,
}: {
  chromeExtensionUrl?: string;
  mozillaExtensionUrl?: string;
  className?: string;
}) => {
  const t = useT();
  const isItChrome = window.navigator.userAgent.includes('Chrome');
  const isItMozilla =
    window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  const onClick = () => {
    if (isItMozilla) {
      window.open(mozillaExtensionUrl, '_blank');
      return;
    }
    if (isItChrome) {
      window.open(chromeExtensionUrl, '_blank');
    }
  };

  const buttonContent = (
    <>
      <div className="flex items-center justify-center gap-1 text-base">
        {t('Get the Vega Wallet')}
        <Pill size="xxs" intent={Intent.Info}>
          ALPHA
        </Pill>
      </div>
      {chromeExtensionUrl && mozillaExtensionUrl && (
        <BrowserIcon
          chromeExtensionUrl={chromeExtensionUrl}
          mozillaExtensionUrl={mozillaExtensionUrl}
        />
      )}
    </>
  );

  return !isItChrome && !isItMozilla ? (
    <div
      className={classNames(
        [
          'bg-vega-blue-350 hover:bg-vega-blue-400 dark:bg-vega-blue-650 dark:hover:bg-vega-blue-600',
          'relative flex h-8 items-center justify-center gap-2 rounded px-3',
        ],
        className
      )}
      data-testid="get-wallet-button"
    >
      {buttonContent}
    </div>
  ) : (
    <TradingButton
      onClick={onClick}
      intent={Intent.Info}
      data-testid="get-wallet-button"
      className={classNames('relative', className)}
      size="small"
      fill
    >
      {buttonContent}
    </TradingButton>
  );
};

const ConnectionOptionWithDescription = ({
  disabled,
  type,
  text,
  onClick,
  icon,
  description,
  title,
}: {
  type: WalletType;
  text: string | ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string | ReactNode;
  title?: string | ReactNode;
}) => {
  return (
    <div>
      <h1 className="text-md">{title}</h1>
      <p className="text-gray-60 text-muted mb-2 text-sm">{description}</p>
      <ConnectionOption
        disabled={disabled}
        type={type}
        text={text}
        onClick={onClick}
        icon={icon}
      />
    </div>
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
      className="relative"
      data-testid={`connector-${type}`}
      disabled={disabled}
      icon={icon}
      fill
    >
      <span className="flex items-center justify-center text-base">{text}</span>
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
  isDesktopWalletRunning: boolean | null;
  onSelect: (type: WalletType) => void;
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  return urlInputExpanded ? (
    <>
      <div className="mb-1.5 flex justify-between">
        <p className="text-secondary text-sm">{t('Custom wallet location')}</p>
        <button
          className="text-muted text-sm"
          onClick={() => setUrlInputExpanded(false)}
        >
          <VegaIcon name={VegaIconNames.ARROW_LEFT} />{' '}
          <span className="underline underline-offset-4">{t('Go back')}</span>
        </button>
      </div>
      <TradingFormGroup
        labelFor="wallet-url"
        label={t('Custom wallet location')}
        hideLabel
      >
        <TradingInput
          value={walletUrl}
          onChange={(e) => setWalletUrl(e.target.value)}
          name="wallet-url"
        />
      </TradingFormGroup>
      <ConnectionOption
        disabled={!isDesktopWalletRunning || Boolean(pubKey)}
        type="jsonRpc"
        text={t('Connect the App/CLI')}
        onClick={() => onSelect('jsonRpc')}
      />
    </>
  ) : (
    <>
      <ConnectionOption
        disabled={!isDesktopWalletRunning || Boolean(pubKey)}
        type="jsonRpc"
        text={t('Use the Desktop App/CLI')}
        onClick={() => onSelect('jsonRpc')}
      />
      {isDesktopWalletRunning !== null && (
        <div className="mb-2 pt-1 text-sm">
          {isDesktopWalletRunning ? (
            <button
              className="text-muted"
              onClick={() => setUrlInputExpanded(true)}
              disabled={Boolean(pubKey)}
            >
              <span className="underline underline-offset-4">
                {t('Enter a custom wallet location')}
              </span>{' '}
              <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
            </button>
          ) : (
            <p className="text-muted leading-tight">
              <Trans
                defaults="<0>No running Desktop App/CLI detected. Open your app now to connect or enter a</0> <1>custom wallet location</1>"
                components={[
                  <span className="text-xs">
                    No running Desktop App/CLI detected. Open your app now to
                    connect or enter a
                  </span>,
                  <button
                    className="text-xs underline"
                    onClick={() => setUrlInputExpanded(true)}
                    disabled={Boolean(pubKey)}
                  >
                    custom wallet location
                  </button>,
                ]}
              />
            </p>
          )}
        </div>
      )}
    </>
  );
};
