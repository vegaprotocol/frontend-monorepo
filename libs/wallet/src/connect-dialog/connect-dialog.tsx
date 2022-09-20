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

export type Connector = {
  type: 'gui' | 'cli' | 'hosted';
  instance: VegaConnector;
};

export interface VegaConnectDialogProps {
  connectors: Connector[];
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
  connectors: Connector[];
  closeDialog: () => void;
  appChainId?: string;
}) => {
  const { VEGA_WALLET_URL } = useEnvironment();
  const [selectedConnector, setSelectedConnector] = useState<Connector>();
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL || '');

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

  return selectedConnector !== undefined ? (
    <SelectedForm
      connector={selectedConnector}
      onConnect={closeDialog}
      walletUrl={walletUrl}
      appChainId={appChainId}
    />
  ) : (
    <ConnectorList
      walletUrl={walletUrl}
      setWalletUrl={setWalletUrl}
      connectors={connectors}
      onSelect={setSelectedConnector}
    />
  );
};

const ConnectorList = ({
  connectors,
  onSelect,
  walletUrl,
  setWalletUrl,
}: {
  connectors: Connector[];
  onSelect: (connector: Connector) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
}) => {
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  const getConnectorName = (c: Connector) => {
    if (c.type === 'cli') {
      return t('Command line wallet app');
    }
    if (c.type === 'gui') {
      return t('Desktop wallet app');
    }
    if (c.type === 'hosted') {
      return t('Hosted Fairground wallet');
    }
    return t('Unknown connector');
  };
  return (
    <>
      <ConnectDialogContent>
        <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
        <ul data-testid="connectors-list" className="mb-6">
          {connectors.map((connector) => (
            <li key={connector.type} className="mb-4 last:mb-0">
              <Button
                onClick={() => onSelect(connector)}
                size="lg"
                fill={true}
                variant={
                  connector.type === 'gui' || connector.type === 'cli'
                    ? 'primary'
                    : 'default'
                }
                data-testid={`connector-${connector.type}`}
              >
                <span className="-mx-6 flex text-left justify-between items-center">
                  {getConnectorName(connector)}
                  <Icon name="chevron-right" />
                </span>
              </Button>
            </li>
          ))}
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
  connector,
  onConnect,
  walletUrl,
  appChainId,
}: {
  connector: Connector;
  onConnect: () => void;
  walletUrl: string;
  appChainId: string;
}) => {
  if (connector.instance instanceof RestConnector) {
    return (
      <>
        <ConnectDialogContent>
          <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
          <div className="mb-2">
            <RestConnectorForm
              connector={connector.instance}
              onConnect={onConnect}
              // Rest connector form is only used for hosted wallet
              walletUrl={HOSTED_WALLET_URL}
            />
          </div>
          {connector.type === 'hosted' && (
            <Link
              href="https://vega-hosted-wallet.on.fleek.co/"
              target="_blank"
              rel="noreferrer"
            >
              <Button fill={true}>{t('Get a hosted wallet')}</Button>
            </Link>
          )}
        </ConnectDialogContent>
        {connector.type === 'hosted' ? (
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

  if (connector.instance instanceof JsonRpcConnector) {
    return (
      <>
        <ConnectDialogContent>
          <JsonRpcConnectorForm
            connector={connector.instance}
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
