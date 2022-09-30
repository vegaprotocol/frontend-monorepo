import {
  Button,
  Dialog,
  FormGroup,
  Icon,
  Input,
  Link,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import { t, useChainIdQuery } from '@vegaprotocol/react-helpers';
import type { VegaConnector, WalletError } from '../connectors';
import { JsonRpcConnector, RestConnector } from '../connectors';
import { RestConnectorForm } from './rest-connector-form';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';
import type { Status } from '../use-json-rpc-connect';
import { useJsonRpcConnect } from '../use-json-rpc-connect';

export const CLOSE_DELAY = 1700;
type Connectors = { [key: string]: VegaConnector };
type WalletType = 'gui' | 'cli' | 'hosted';

export interface VegaConnectDialogProps {
  connectors: Connectors;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

export const VegaConnectDialog = ({
  connectors,
  dialogOpen,
  setDialogOpen,
}: VegaConnectDialogProps) => {
  const { data } = useChainIdQuery();

  return (
    <Dialog open={dialogOpen} size="small" onChange={setDialogOpen}>
      <ConnectDialogContainer
        connectors={connectors}
        closeDialog={() => setDialogOpen(false)}
        appChainId={data?.statistics.chainId}
      />
    </Dialog>
  );
};

const ConnectDialogContainer = ({
  connectors,
  closeDialog,
  appChainId,
}: {
  connectors: Connectors;
  closeDialog: () => void;
  appChainId?: string;
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

  const handleSelect = (type: WalletType) => {
    // Only cli is currently uses JsonRpc, this will need to be updated
    // when gui does too
    const connector =
      type === 'cli' ? connectors['jsonRpc'] : connectors['rest'];

    // If the user has selected hosted wallet ensure that we are connecting to https://vega-hosted-wallet.on.fleek.co/
    // otherwise use the default walletUrl or what has been put in the input
    connector.url =
      type === 'hosted' && HOSTED_WALLET_URL ? HOSTED_WALLET_URL : walletUrl;
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
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
  isMainnet: boolean;
}) => {
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  return (
    <>
      <ConnectDialogContent>
        <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
        <ul data-testid="connectors-list" className="mb-6">
          <li className="mb-4">
            <ConnectionOption
              type="gui"
              text={t('Desktop wallet app')}
              onClick={() => onSelect('gui')}
            />
          </li>
          <li className="mb-4 last:mb-0">
            <ConnectionOption
              type="cli"
              text={t('Command line wallet app')}
              onClick={() => onSelect('cli')}
            />
          </li>
          {!isMainnet && (
            <li className="mb-0">
              <ConnectionOption
                type="hosted"
                text={t('Hosted Fairground wallet')}
                onClick={() => onSelect('hosted')}
              />
            </li>
          )}
        </ul>
        {urlInputExpanded ? (
          <FormGroup label={t('Wallet location')} labelFor="wallet-url">
            <Input
              value={walletUrl}
              onChange={(e) => setWalletUrl(e.target.value)}
              name="wallet-url"
            />
          </FormGroup>
        ) : (
          <p className="mb-6 text-center text-neutral-600 dark:text-neutral-400">
            {t('Or')}{' '}
            <button
              className="underline"
              onClick={() => setUrlInputExpanded(true)}
            >
              {t('enter a custom wallet location')}
            </button>{' '}
            {t('to change port or service URL')}
          </p>
        )}
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
}: {
  type: WalletType;
  connector: VegaConnector;
  appChainId?: string;
  jsonRpcState: {
    status: Status;
    error: WalletError | null;
  };
  reset: () => void;
  onConnect: () => void;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <>
        <ConnectDialogContent>
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
                href="https://vega-hosted-wallet.on.fleek.co/"
                target="_blank"
                rel="noreferrer"
              >
                {t('hosted wallet')}
              </Link>
              {t(', or for the real experience create a wallet in the ')}
              <Link href="https://github.com/vegaprotocol/vega/releases">
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
      <>
        <ConnectDialogContent>
          <JsonRpcConnectorForm
            connector={connector}
            status={jsonRpcState.status}
            error={jsonRpcState.error}
            onConnect={onConnect}
            appChainId={appChainId}
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
      variant={type === 'hosted' ? 'default' : 'primary'}
      data-testid={`connector-${type}`}
    >
      <span className="-mx-6 flex text-left justify-between items-center">
        {text}
        <Icon name="chevron-right" />
      </span>
    </Button>
  );
};
