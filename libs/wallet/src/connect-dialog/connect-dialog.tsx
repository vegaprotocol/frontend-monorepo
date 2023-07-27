import { create } from 'zustand';
import {
  Button,
  Dialog,
  FormGroup,
  Input,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { t } from '@vegaprotocol/i18n';
import type { VegaConnector } from '../connectors';
import { InjectedConnector } from '../connectors';
import { ViewConnector } from '../connectors';
import { JsonRpcConnector, RestConnector } from '../connectors';
import { RestConnectorForm } from './rest-connector-form';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';
import type { Status as JsonRpcStatus } from '../use-json-rpc-connect';
import type { Status as InjectedStatus } from '../use-injected-connector';
import { useJsonRpcConnect } from '../use-json-rpc-connect';
import { ViewConnectorForm } from './view-connector-form';
import { useChainIdQuery } from './__generated__/ChainId';
import { useVegaWallet } from '../use-vega-wallet';
import { useInjectedConnector } from '../use-injected-connector';
import { InjectedConnectorForm } from './injected-connector-form';

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
}: {
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isMainnet: boolean;
}) => {
  return (
    <>
      <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
      <CustomUrlInput walletUrl={walletUrl} setWalletUrl={setWalletUrl} />
      <ul data-testid="connectors-list" className="mb-6">
        <li className="mb-4 last:mb-0">
          <ConnectionOption
            type="jsonRpc"
            text={t('Connect Vega wallet')}
            onClick={() => onSelect('jsonRpc')}
          />
        </li>
        {'vega' in window && (
          <li className="mb-4 last:mb-0">
            <ConnectionOption
              type="injected"
              text={t('Connect Web wallet')}
              onClick={() => onSelect('injected')}
            />
          </li>
        )}
        {!isMainnet && (
          <li className="mb-4 last:mb-0">
            <ConnectionOption
              type="rest"
              text={t('Hosted Fairground wallet')}
              onClick={() => onSelect('rest')}
            />
          </li>
        )}
        <li className="mb-4 last:mb-0">
          <div className="my-4 text-center">{t('OR')}</div>
          <ConnectionOption
            type="view"
            text={t('View as vega user')}
            onClick={() => onSelect('view')}
          />
        </li>
      </ul>
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

const ConnectionOption = ({
  type,
  text,
  onClick,
}: {
  type: WalletType;
  text: string;
  onClick: () => void;
}) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      fill={true}
      variant={['rest', 'view'].includes(type) ? 'default' : 'primary'}
      data-testid={`connector-${type}`}
    >
      <span className="-mx-10 flex text-left justify-between items-center">
        {text}
        <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
      </span>
    </Button>
  );
};

const CustomUrlInput = ({
  walletUrl,
  setWalletUrl,
}: {
  walletUrl: string;
  setWalletUrl: (url: string) => void;
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
    <p className="mb-6">
      {t(
        'Choose wallet app to connect, or to change port or server URL enter a '
      )}
      <button className="underline" onClick={() => setUrlInputExpanded(true)}>
        {t('custom wallet location')}
      </button>{' '}
      {t(' first')}
    </p>
  );
};
