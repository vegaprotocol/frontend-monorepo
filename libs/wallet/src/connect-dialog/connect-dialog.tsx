import {
  Button,
  Dialog,
  FormGroup,
  Icon,
  Input,
  Link,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { t, useChainIdQuery } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';
import { JsonRpcConnector, RestConnector } from '../connectors';
import { RestConnectorForm } from './rest-connector-form';
import { JsonRpcConnectorForm } from './json-rpc-connector-form';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectDialogContent,
  ConnectDialogFooter,
  ConnectDialogTitle,
} from './connect-dialog-elements';

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
  const { VEGA_WALLET_URL } = useEnvironment();
  const [selectedConnector, setSelectedConnector] = useState<VegaConnector>();
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL || '');
  const [walletType, setWalletType] = useState<WalletType>();

  if (!appChainId) {
    return (
      <ConnectDialogContent>
        <ConnectDialogTitle>{t('Fetching chain ID')}</ConnectDialogTitle>
        <div className="flex justify-center items-center my-6">
          <Loader />
        </div>
      </ConnectDialogContent>
    );
  }

  return selectedConnector !== undefined && walletType !== undefined ? (
    <SelectedForm
      type={walletType}
      connector={selectedConnector}
      onConnect={closeDialog}
      walletUrl={walletUrl}
      appChainId={appChainId}
    />
  ) : (
    <ConnectorList
      walletUrl={walletUrl}
      setWalletUrl={setWalletUrl}
      onSelect={(type) => {
        const connector = type === 'cli' ? connectors.jsonRpc : connectors.rest;
        setSelectedConnector(connector);
        setWalletType(type);
      }}
    />
  );
};

const ConnectorList = ({
  onSelect,
  walletUrl,
  setWalletUrl,
}: {
  onSelect: (type: WalletType) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
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
          <li className="mb-4">
            <ConnectionOption
              type="cli"
              text={t('Command line wallet app')}
              onClick={() => onSelect('cli')}
            />
          </li>
          <li className="mb-0">
            <ConnectionOption
              type="hosted"
              text={t('Hosted Fairground wallet')}
              onClick={() => onSelect('hosted')}
            />
          </li>
        </ul>
        {urlInputExpanded ? (
          <FormGroup label={t('Wallet location')} labelFor="wallet-url">
            <div className="flex gap-4 items-center">
              <Input
                value={walletUrl}
                onChange={(e) => setWalletUrl(e.target.value)}
                name="wallet-url"
              />
              <button
                className="underline"
                onClick={() => setUrlInputExpanded(false)}
              >
                {t('Update')}
              </button>
            </div>
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

export const HOSTED_WALLET_URL = 'https://wallet.testnet.vega.xyz';

const SelectedForm = ({
  type,
  connector,
  onConnect,
  walletUrl,
  appChainId,
}: {
  type: WalletType;
  connector: VegaConnector;
  onConnect: () => void;
  walletUrl: string;
  appChainId: string;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <>
        <ConnectDialogContent>
          <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
          <div className="mb-2">
            <RestConnectorForm
              connector={connector}
              onConnect={onConnect}
              // Rest connector form is only used for hosted wallet
              walletUrl={type === 'hosted' ? HOSTED_WALLET_URL : walletUrl}
            />
          </div>
          {type === 'hosted' && (
            <Link
              href="https://vega-hosted-wallet.on.fleek.co/"
              target="_blank"
              rel="noreferrer"
            >
              <Button fill={true}>{t('Get a hosted wallet')}</Button>
            </Link>
          )}
        </ConnectDialogContent>
        {type === 'hosted' ? (
          <ConnectDialogFooter>
            <p>
              {t('For demo purposes only. ')}
              <Link href="https://github.com/vegaprotocol/vega/releases">
                {t('Get a Vega Wallet')}
              </Link>
              {t(' for the real Vega experience')}
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
            onConnect={onConnect}
            walletUrl={walletUrl}
            appChainId={appChainId}
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
