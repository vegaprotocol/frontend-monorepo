import { useCallback, useEffect, useState } from 'react';
import { ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaConnector } from '../connectors';
import { RestConnector } from '../connectors';
import { RestConnectorForm } from '../rest-connector-form';
import { useVegaWallet } from '../use-vega-wallet';

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

  // Connects with the provided connector instance and closes the modal
  const connectAndClose = useCallback(
    (connector: VegaConnector) => {
      connect(connector);
      setDialogOpen(false);
    },
    [connect, setDialogOpen]
  );

  // Effect to immediately connect if the selected connector is NOT a
  // rest connector
  useEffect(() => {
    if (
      selectedConnector !== null &&
      !(selectedConnector instanceof RestConnector)
    ) {
      connectAndClose(selectedConnector);
    }
  }, [selectedConnector, connectAndClose]);

  return (
    <Dialog
      open={dialogOpen}
      onChange={setDialogOpen}
      title="Connect to your Vega Wallet"
      size="small"
    >
      {selectedConnector instanceof RestConnector ? (
        <RestConnectorForm
          connector={selectedConnector}
          onAuthenticate={() => {
            connectAndClose(selectedConnector);
          }}
        />
      ) : (
        <ul
          className="flex flex-col justify-center gap-4 items-start"
          data-testid="connectors-list"
        >
          {Object.entries(connectors).map(([key, connector]) => (
            <li key={key} className="mb-2 last:mb-0">
              <ButtonLink
                key={key}
                onClick={() => setSelectedConnector(connector)}
              >
                {t(`${key}`).charAt(0).toUpperCase() +
                  t(`${key} provider`).slice(1)}
              </ButtonLink>

              <p>{connector.description}</p>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
