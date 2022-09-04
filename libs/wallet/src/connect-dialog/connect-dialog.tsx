import { Button, Dialog, Loader } from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';
import { JsonRpcConnector } from '../connectors';
import { RestConnector } from '../connectors';
import { RestConnectorForm } from '../rest-connector-form';
import { useVegaWallet } from '../use-vega-wallet';
import { JsonRpcConnectorForm } from '../json-rpc-connector-form';

export interface VegaConnectDialogProps {
  connectors: { [name: string]: VegaConnector };
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
}

export function VegaConnectDialog({
  connectors,
  dialogOpen,
  setDialogOpen,
}: VegaConnectDialogProps) {
  const { connect } = useVegaWallet();

  // Selected connector, we need to show the auth form if the rest connector (which is
  // currently the only way to connect) is selected.
  const [selectedConnector, setSelectedConnector] =
    useState<VegaConnector | null>(null);

  const handleConnect = useCallback(
    async (connector: VegaConnector) => {
      setSelectedConnector(connector);
      const success = await connect(connector);
      if (success) {
        setDialogOpen(false);
      }
    },
    [connect, setDialogOpen]
  );

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
        <SelectedForm connector={selectedConnector} onConnect={handleConnect} />
      ) : (
        <ul
          className="flex flex-col justify-center gap-4 items-start"
          data-testid="connectors-list"
        >
          {Object.entries(connectors).map(([key, connector]) => (
            <li key={key} className="mb-2 last:mb-0">
              <button
                key={key}
                onClick={() => handleConnect(connector)}
                className="capitalize hover:text-vega-pink dark:hover:text-vega-yellow underline"
              >
                {t(`${key} provider`)}
              </button>
              <p>{connector.description}</p>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}

const SelectedForm = ({
  connector,
  onConnect,
}: {
  connector: VegaConnector;
  onConnect: (connector: VegaConnector) => void;
}) => {
  if (connector instanceof RestConnector) {
    return (
      <RestConnectorForm
        connector={connector}
        onConnect={() => onConnect(connector)}
      />
    );
  }

  if (connector instanceof JsonRpcConnector) {
    return (
      <JsonRpcConnectorForm
        connector={connector}
        onConnect={() => onConnect(connector)}
      />
    );
  }

  return <div>Unknown connector</div>;
};
