import { useCallback, useState } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { VegaConnector } from './connectors';
import { RestConnectorForm } from './rest-connector-form';
import { useEffect } from 'react';
import { RestConnector, useVegaWallet } from '.';

interface VegaConnectDialogProps {
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
  const [selectedConnector, setSelectedConnector] =
    useState<VegaConnector | null>(null);

  const connectAndClose = useCallback(
    (connector: VegaConnector) => {
      connect(connector);
      setDialogOpen(false);
    },
    [connect, setDialogOpen]
  );

  useEffect(() => {
    if (
      selectedConnector !== null &&
      selectedConnector instanceof RestConnector === false
    ) {
      connectAndClose(selectedConnector);
    }
  }, [selectedConnector, connectAndClose]);

  return (
    <Dialog open={dialogOpen} setOpen={setDialogOpen}>
      {selectedConnector instanceof RestConnector ? (
        <RestConnectorForm
          connector={selectedConnector}
          setDialogOpen={setDialogOpen}
          onAuthenticate={() => {
            connectAndClose(selectedConnector);
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {Object.entries(connectors).map(([key, connector]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedConnector(connector);
                // if (key === 'rest') {
                //   // show form so that we can get an authentication token before 'connecting'
                //   setIsRestConnector(true);
                // } else {
                //   connect(connector);
                //   setDialogOpen(false);
                // }
              }}
            >
              {key} provider
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
