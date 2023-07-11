import { create } from 'zustand';
import {
  Button,
  Dialog,
  FormGroup,
  Icon,
  Input,
  Link,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import type { WalletClientError } from '@vegaprotocol/wallet-client';
import { t } from '@vegaprotocol/i18n';
import type { VegaConnector } from '../connectors';
import { ViewConnector } from '../connectors';
import { JsonRpcConnector, RestConnector } from '../connectors';
import { RestConnectorForm } from './rest-connector-form';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import {
  Networks,
  useEnvironment,
  ExternalLinks,
} from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';
import type { Status } from '../use-json-rpc-connect';
import { useJsonRpcConnect } from '../use-json-rpc-connect';
import { ViewConnectorForm } from './view-connector-form';
import { useChainIdQuery } from './__generated__/ChainId';
import { useVegaWallet } from '../use-vega-wallet';

export const CLOSE_DELAY = 1700;
type Connectors = { [key: string]: VegaConnector };
type WalletType = 'jsonRpc' | 'hosted' | 'view';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  onChangeOpen?: (open: boolean) => void;
  riskMessage?: React.ReactNode;
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

export interface VegaWalletDialogStore {
  vegaWalletDialogOpen: boolean;
  updateVegaWalletDialog: (open: boolean) => void;
  openVegaWalletDialog: () => void;
  closeVegaWalletDialog: () => void;
}

export const VegaConnectDialog = ({
  connectors,
  onChangeOpen,
  riskMessage,
}: VegaConnectDialogProps) => {
  const vegaWalletDialogOpen = useVegaWalletDialogStore(
    (store) => store.vegaWalletDialogOpen
  );
  const updateVegaWalletDialog = useVegaWalletDialogStore(
    (store) => (open: boolean) => {
      store.updateVegaWalletDialog(open);
      onChangeOpen?.(open);
    }
  );
  const closeVegaWalletDialog = useVegaWalletDialogStore((store) => () => {
    store.closeVegaWalletDialog();
    onChangeOpen?.(false);
  });
  const { disconnect, acknowledgeNeeded } = useVegaWallet();
  const onVegaWalletDialogChange = useCallback(
    (open: boolean) => {
      updateVegaWalletDialog(open);
      if (!open && acknowledgeNeeded) {
        disconnect();
      }
    },
    [updateVegaWalletDialog, acknowledgeNeeded, disconnect]
  );

  const { data, error, loading } = useChainIdQuery();

  const renderContent = () => {
    if (error) {
      return (
        <ConnectDialogContent>
          <ConnectDialogTitle>
            {t('Could not retrieve chain id')}
          </ConnectDialogTitle>
          <ConnectDialogFooter />
        </ConnectDialogContent>
      );
    }

    if (loading || !data) {
      return (
        <ConnectDialogContent>
          <ConnectDialogTitle>{t('Fetching chain ID')}</ConnectDialogTitle>
          <div className="flex justify-center items-center my-6">
            <Loader />
          </div>
          <ConnectDialogFooter />
        </ConnectDialogContent>
      );
    }

    return (
      <ConnectDialogContainer
        connectors={connectors}
        closeDialog={closeVegaWalletDialog}
        appChainId={data.statistics.chainId}
        riskMessage={riskMessage}
      />
    );
  };

  return (
    <Dialog
      open={vegaWalletDialogOpen}
      size="small"
      onChange={onVegaWalletDialogChange}
    >
      {renderContent()}
    </Dialog>
  );
};

const ConnectDialogContainer = ({
  connectors,
  closeDialog,
  appChainId,
  riskMessage,
}: {
  connectors: Connectors;
  closeDialog: () => void;
  appChainId: string;
  riskMessage?: React.ReactNode;
}) => {
  const { VEGA_WALLET_URL, VEGA_ENV, HOSTED_WALLET_URL } = useEnvironment();
  const [selectedConnector, setSelectedConnector] = useState<VegaConnector>();
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL || '');
  const [walletType, setWalletType] = useState<WalletType>();
  const reset = useCallback(() => {
    setSelectedConnector(undefined);
    setWalletType(undefined);
  }, []);

  const delayedOnConnect = useCallback(() => {
    setTimeout(() => {
      closeDialog();
    }, CLOSE_DELAY);
  }, [closeDialog]);

  const { connect, ...jsonRpcState } = useJsonRpcConnect(delayedOnConnect);

  const handleSelect = (type: WalletType, isHosted = false) => {
    let connector;

    if (isHosted) {
      // If the user has selected hosted wallet ensure that we are connecting to https://vega-hosted-wallet.on.fleek.co/
      // otherwise use the default walletUrl or what has been put in the input
      connector = connectors['rest'];
      connector.url = HOSTED_WALLET_URL || walletUrl;
    } else {
      connector = connectors[type];
      connector.url = walletUrl;
    }

    if (!connector) {
      throw new Error(`Connector type: ${type} not configured`);
    }

    setSelectedConnector(connector);
    setWalletType(type);

    // Immediately connect on selection if jsonRpc is selected, we can't do this
    // for rest because we need to show an authentication form
    if (connector instanceof JsonRpcConnector) {
      connect(connector, appChainId);
    }
  };

  return selectedConnector !== undefined && walletType !== undefined ? (
    <SelectedForm
      type={walletType}
      connector={selectedConnector}
      jsonRpcState={jsonRpcState}
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
  );
};

const ConnectorList = ({
  onSelect,
  walletUrl,
  setWalletUrl,
  isMainnet,
}: {
  onSelect: (type: WalletType, isHosted?: boolean) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isMainnet: boolean;
}) => {
  return (
    <>
      <ConnectDialogContent>
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
          {!isMainnet && (
            <li className="mb-4 last:mb-0">
              <ConnectionOption
                type="hosted"
                text={t('Hosted Fairground wallet')}
                onClick={() => onSelect('hosted', true)}
              />
            </li>
          )}
          <li className="mb-4 last:mb-0">
            <div className="my-4 text-center text-vega-dark-400">{t('OR')}</div>
            <ConnectionOption
              type="view"
              text={t('View as vega user')}
              onClick={() => onSelect('view')}
            />
          </li>
        </ul>
      </ConnectDialogContent>
      <ConnectDialogFooter />
    </>
  );
};

const SelectedForm = ({
  type,
  connector,
  appChainId,
  jsonRpcState,
  reset,
  onConnect,
  riskMessage,
}: {
  type: WalletType;
  connector: VegaConnector;
  appChainId: string;
  jsonRpcState: {
    status: Status;
    error: WalletClientError | null;
  };
  reset: () => void;
  onConnect: () => void;
  riskMessage?: React.ReactNode;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <>
        <ConnectDialogContent>
          <button
            onClick={reset}
            className="absolute p-2 top-0 left-0 md:top-2 md:left-2"
            data-testid="back-button"
          >
            <Icon name={'chevron-left'} ariaLabel="back" size={4} />
          </button>
          <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
          <div className="mb-2">
            <RestConnectorForm connector={connector} onConnect={onConnect} />
          </div>
        </ConnectDialogContent>
        {type === 'hosted' ? (
          <ConnectDialogFooter>
            <p className="text-center">
              {t('For demo purposes get a ')}
              <Link
                href={ExternalLinks.VEGA_WALLET_HOSTED_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('hosted wallet')}
              </Link>
              {t(', or for the real experience create a wallet in the ')}
              <Link href={ExternalLinks.VEGA_WALLET_URL}>
                {t('Vega wallet app')}
              </Link>
            </p>
          </ConnectDialogFooter>
        ) : (
          <ConnectDialogFooter />
        )}
      </>
    );
  }

  if (connector instanceof JsonRpcConnector) {
    return (
      <ConnectDialogContent>
        <JsonRpcConnectorForm
          connector={connector}
          status={jsonRpcState.status}
          error={jsonRpcState.error}
          onConnect={onConnect}
          appChainId={appChainId}
          reset={reset}
          riskMessage={riskMessage}
        />
      </ConnectDialogContent>
    );
  }

  if (connector instanceof ViewConnector) {
    return (
      <>
        <ConnectDialogContent>
          <ViewConnectorForm
            connector={connector}
            onConnect={onConnect}
            reset={reset}
          />
        </ConnectDialogContent>
        <ConnectDialogFooter />
      </>
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
      variant={['hosted', 'view'].includes(type) ? 'default' : 'primary'}
      data-testid={`connector-${type}`}
    >
      <span className="-mx-6 flex text-left justify-between items-center">
        {text}
        <Icon name="chevron-right" />
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
      <p className="mb-2 text-neutral-600 dark:text-neutral-400">
        {t('Custom wallet location')}
      </p>
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
      <p className="mb-2 text-neutral-600 dark:text-neutral-400">
        {t('Choose wallet app to connect')}
      </p>
    </>
  ) : (
    <p className="mb-6 text-neutral-600 dark:text-neutral-400">
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
