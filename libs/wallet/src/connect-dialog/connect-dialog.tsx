import {
  Button,
  Dialog,
  FormGroup,
  Input,
  Loader,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';
import { JsonRpcConnector } from '../connectors';
import { RestConnector } from '../connectors';
import { RestConnectorForm } from '../rest-connector-form';
import { useVegaWallet } from '../use-vega-wallet';
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
  const { VEGA_WALLET_URL } = useEnvironment();
  // Selected connector, we need to show the auth form if the rest connector (which is
  // currently the only way to connect) is selected.
  const [selectedConnector, setSelectedConnector] =
    useState<VegaConnector | null>(null);
  const [walletUrl, setWalletUrl] = useState(VEGA_WALLET_URL);

  const onConnect = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);

  return (
    <Dialog
      open={dialogOpen}
      size="small"
      onChange={(open) => {
        if (!open) {
          setSelectedConnector(null);
        }
        setDialogOpen(open);
      }}
      title={t('Connect Vega wallet')}
    >
      {selectedConnector !== null ? (
        <SelectedForm
          connector={selectedConnector}
          onConnect={onConnect}
          walletUrl={walletUrl}
        />
      ) : (
        <ConnectorList
          walletUrl={walletUrl}
          setWalletUrl={setWalletUrl}
          connectors={connectors}
          onSelect={setSelectedConnector}
        />
      )}
    </Dialog>
  );
}

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
  const [locationInputExpanded, setLocationInputExpanded] = useState(false);
  return (
    <>
      {locationInputExpanded ? (
        <FormGroup label={t('Wallet location')} labelFor="wallet-url">
          <Input
            value={walletUrl}
            onChange={(e) => setWalletUrl(e.target.value)}
            name="wallet-url"
          />
        </FormGroup>
      ) : (
        <p className="mb-4">
          Change wallet location?{' '}
          <button
            className="underline"
            onClick={() => setLocationInputExpanded(true)}
          >
            Change
          </button>
        </p>
      )}
      <ul data-testid="connectors-list">
        {Object.entries(connectors).map(([key, connector]) => (
          <li key={key} className="mb-4 last:mb-0">
            <Button
              key={key}
              variant="primary"
              onClick={() => onSelect(connector)}
              fill={true}
            >
              {t(`${key} provider`)}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};

const SelectedForm = ({
  connector,
  onConnect,
  walletUrl,
}: {
  connector: VegaConnector;
  onConnect: () => void;
  walletUrl: string;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <RestConnectorForm
        connector={connector}
        onConnect={onConnect}
        walletUrl={walletUrl}
      />
    );
  }

  if (connector instanceof JsonRpcConnector) {
    return (
      <JsonRpcConnectorForm
        connector={connector}
        onConnect={onConnect}
        walletUrl={walletUrl}
      />
    );
  }

  throw new Error('No connector selected');
};
