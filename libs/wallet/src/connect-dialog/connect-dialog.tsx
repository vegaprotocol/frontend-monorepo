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
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { t } from '@vegaprotocol/i18n';
import type { Connectors, VegaConnector } from '../connectors';
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
import type { Status as JsonRpcStatus } from '../use-json-rpc-connect';
import { useJsonRpcConnect } from '../use-json-rpc-connect';
import type { Status as InjectedStatus } from '../use-injected-connector';
import { useInjectedConnector } from '../use-injected-connector';
import { useChainIdQuery } from './__generated__/ChainId';
import { useVegaWallet } from '../use-vega-wallet';
import { InjectedConnectorForm } from './injected-connector-form';
import { isBrowserWalletInstalled } from '../utils';
import { useIsWalletServiceRunning } from '../use-is-wallet-service-running';
import { SnapStatus, useSnapStatus } from '../use-snap-status';
import { useVegaWalletDialogStore } from './vega-wallet-dialog-store';

export const CLOSE_DELAY = 1700;

export type WalletType = 'injected' | 'jsonRpc' | 'view' | 'snap';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  riskMessage?: ReactNode;
  contentOnly?: boolean;
  closeDialogParam?: () => void;
}

export const VegaConnectDialog = ({
  connectors,
  riskMessage,
  contentOnly,
  closeDialogParam,
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

  const content = data && (
    <ConnectDialogContainer
      connectors={connectors}
      appChainId={data.statistics.chainId}
      riskMessage={riskMessage}
      closeDialogParam={closeDialogParam}
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
  closeDialogParam,
}: {
  connectors: Connectors;
  appChainId: string;
  riskMessage?: ReactNode;
  closeDialogParam?: () => void;
}) => {
  const { vegaUrl, vegaWalletServiceUrl } = useVegaWallet();
  const closeVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.closeVegaWalletDialog
  );
  const closeDialog = useCallback(() => {
    closeDialogParam ? closeDialogParam() : closeVegaWalletDialog();
  }, [closeVegaWalletDialog, closeDialogParam]);
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
  const { pubKey, links } = useVegaWallet();
  const title = isBrowserWalletInstalled()
    ? t('Connect Vega wallet')
    : t('Get a Vega wallet');

  const extendedText = (
    <>
      <div className="flex items-center justify-center w-full h-full text-base gap-1">
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
    : 'your browser';

  return (
    <>
      <ConnectDialogTitle>{title}</ConnectDialogTitle>
      <p className="text-md">
        {t(
          'Connect securely, deposit funds and approve or reject transactions with the Vega wallet'
        )}
      </p>
      <div data-testid="connectors-list" className="flex flex-col mt-4 gap-2">
        {isBrowserWalletInstalled() ? (
          <ConnectionOptionWithDescription
            type="injected"
            text={extendedText}
            onClick={() => onSelect('injected')}
            title={
              <>
                <span>{t('Vega Wallet')}</span>
                {'  '}
                <span className="text-xs">{t('full featured')}</span>
              </>
            }
            description={t(
              `Connect with Vega Wallet extension
              for %s to access all features including key
              management and detailed transaction views from your
              browser.`,
              [browserName]
            )}
          />
        ) : (
          <div>
            <h1 className="mb-1 text-lg">
              <span>{t('Vega Wallet')}</span>
              {'  '}
              <span className="text-xs"> {t('full featured')}</span>
            </h1>
            <p className="mb-2 text-sm">
              {t(
                `Install Vega Wallet extension
              for %s to access all features including key
              management and detailed transaction views from your
              browser.`,
                [browserName]
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
                  <>
                    <span>{t('Metamask Snap')}</span>
                    {'  '}
                    <span className="text-xs"> {t('quick start')}</span>
                  </>
                }
                description={t(
                  `Connect directly via Metamask with the Vega Snap for single key support without advanced features.`
                )}
                text={
                  <>
                    <div className="flex items-center justify-center w-full h-full text-base gap-1">
                      {t('Connect via Vega MetaMask Snap')}
                    </div>
                    <div className="absolute top-0 flex items-center h-8 right-1">
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
                    <>
                      <span>{t('Metamask Snap')}</span>
                      {'  '}
                      <span className="text-xs"> {t('quick start')}</span>
                    </>
                  }
                  description={t(
                    `Install Metamask with the Vega Snap for single key support without advanced features.`
                  )}
                  text={
                    <>
                      <div className="flex items-center justify-center w-full h-full text-base gap-1">
                        {t('Install Vega MetaMask Snap')}
                      </div>
                      <div className="absolute top-0 flex items-center h-8 right-1">
                        <VegaIcon name={VegaIconNames.METAMASK} size={24} />
                      </div>
                    </>
                  }
                  onClick={() => {
                    requestSnap(DEFAULT_SNAP_ID);
                  }}
                />
                {snapStatus === SnapStatus.NOT_SUPPORTED ? (
                  <p className="pt-1 text-xs leading-tight text-muted">
                    {t('No MetaMask version that supports snaps detected.')}{' '}
                    {t('Learn more about')}{' '}
                    <ExternalLink href="https://metamask.io/snaps/">
                      MetaMask Snaps
                    </ExternalLink>
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
        <div>
          <h1 className="mb-1 text-md">{t('Advanced / Other options...')}</h1>
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
      <div className="flex items-center justify-center text-base gap-1">
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
          'flex gap-2 items-center justify-center rounded h-8 px-3 relative',
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
      <p className="mb-2 text-sm text-gray-60 text-muted">{description}</p>
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
  const { pubKey } = useVegaWallet();
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  return urlInputExpanded ? (
    <>
      <div className="flex justify-between mb-1.5">
        <p className="text-sm text-secondary">{t('Custom wallet location')}</p>
        <button
          className="text-sm text-muted"
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
        <div className="pt-1 mb-2 text-sm">
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
            <p className="leading-tight text-muted">
              <span className="text-xs">
                {t(
                  'No running Desktop App/CLI detected. Open your app now to connect or enter a'
                )}
              </span>{' '}
              <button
                className="text-xs underline"
                onClick={() => setUrlInputExpanded(true)}
                disabled={Boolean(pubKey)}
              >
                {t('custom wallet location')}
              </button>
            </p>
          )}
        </div>
      )}
    </>
  );
};
