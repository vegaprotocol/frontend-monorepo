import {
  Button,
  Dialog,
  FormGroup,
  Icon,
  Input,
  Link,
} from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';
import { JsonRpcConnector } from '../connectors';
import { RestConnector } from '../connectors';
import { RestConnectorForm } from '../rest-connector-form';
import { JsonRpcConnectorForm } from '../json-rpc-connector-form';
import { useEnvironment } from '@vegaprotocol/environment';

type Connectors = { [name: string]: VegaConnector };
export interface VegaConnectDialogProps {
  connectors: Connectors;
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

export function VegaConnectDialog({
  connectors,
  dialogOpen,
  setDialogOpen,
}: VegaConnectDialogProps) {
  return (
    <Dialog open={dialogOpen} size="small" onChange={setDialogOpen}>
      <ConnectDialogContainer
        connectors={connectors}
        closeDialog={() => setDialogOpen(false)}
      />
    </Dialog>
  );
}

const ConnectDialogContainer = ({
  connectors,
  closeDialog,
}: {
  connectors: Connectors;
  closeDialog: () => void;
}) => {
  const { VEGA_WALLET_URL } = useEnvironment();
  // Selected connector, we need to show the auth form if the rest connector (which is
  // currently the only way to connect) is selected.
  const [selectedConnector, setSelectedConnector] =
    useState<VegaConnector | null>(null);
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL || '');

  return (
    <>
      <ConnectDialogContent>
        {selectedConnector !== null ? (
          <SelectedForm
            connector={selectedConnector}
            onConnect={closeDialog}
            walletUrl={walletUrl}
            // appChainId={data.statistics.chainId}
          />
        ) : (
          <ConnectorList
            walletUrl={walletUrl}
            setWalletUrl={setWalletUrl}
            connectors={connectors}
            onSelect={setSelectedConnector}
          />
        )}
      </ConnectDialogContent>
      <footer className="flex justify-center gap-4 pt-6 -px-4 md:-mx-8 border-t border-neutral-500 text-neutral-600 dark:text-neutral-400">
        <Link href="https://github.com/vegaprotocol/vega/releases">
          {t('Get a Vega Wallet')}
        </Link>
        {' | '}
        <Link href="https://docs.vega.xyz/docs/mainnet/concepts/vega-wallet">
          {t('Having trouble?')}
        </Link>
      </footer>
    </>
  );
};

const ConnectorList = ({
  connectors,
  onSelect,
  walletUrl,
  setWalletUrl,
}: {
  connectors: Connectors;
  onSelect: (connector: VegaConnector) => void;
  walletUrl: string;
  setWalletUrl: (value: string) => void;
}) => {
  const [urlInputExpanded, setUrlInputExpanded] = useState(false);
  const getButtonText = (c: VegaConnector) => {
    if (c instanceof RestConnector) {
      return t('Hosted wallet');
    } else {
      return t('Vega wallet (CLI or GUI)');
    }
  };
  return (
    <>
      <ConnectDialogTitle>{t('Connect')}</ConnectDialogTitle>
      <ul data-testid="connectors-list" className="mb-6">
        {Object.entries(connectors)
          .sort(([key]) => {
            // ensure rest (hosted wallet is below)
            return key === 'rest' ? 1 : -1;
          })
          .map(([key, connector]) => (
            <li key={key} className="mb-4 last:mb-0">
              <Button
                key={key}
                onClick={() => onSelect(connector)}
                size="lg"
                variant={
                  connector instanceof JsonRpcConnector ? 'primary' : 'default'
                }
                fill={true}
              >
                <span className="-mx-6 flex text-left justify-between items-center">
                  {getButtonText(connector)}
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
            className="underline text-black dark:text-white"
            onClick={() => setUrlInputExpanded(true)}
          >
            {t('enter a custom wallet location')}
          </button>{' '}
          {t('to change port or service URL')}
        </p>
      )}
    </>
  );
};

const SelectedForm = ({
  connector,
  onConnect,
  walletUrl,
  appChainId,
}: {
  connector: VegaConnector;
  onConnect: () => void;
  walletUrl: string;
  appChainId?: string;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <RestConnectorForm
        connector={connector}
        onConnect={onConnect}
        // Rest connector form is only used for hosted wallet
        walletUrl="https://wallet.testnet.vega.xyz"
      />
    );
  }

  if (connector instanceof JsonRpcConnector) {
    return (
      <JsonRpcConnectorForm
        connector={connector}
        onConnect={onConnect}
        walletUrl={walletUrl}
        appChainId={appChainId}
      />
    );
  }

  throw new Error('No connector selected');
};

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-2xl uppercase mb-6 text-center">{children}</h1>;
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="mb-6">{children}</div>;
};
