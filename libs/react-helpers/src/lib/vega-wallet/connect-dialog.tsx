import { useState } from 'react';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import {
  InjectedConnector,
  RestConnector,
  VegaConnector,
} from './vega-wallet-connectors';
import { RestConnectorForm } from './rest-connector-form';
import { useEffect } from 'react';

export const Connectors = {
  injected: new InjectedConnector(),
  rest: new RestConnector(),
};

interface ConnectDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  connect: (connector: VegaConnector) => void;
}

export function ConnectDialog({
  dialogOpen,
  setDialogOpen,
  connect,
}: ConnectDialogProps) {
  const [isRestConnector, setIsRestConnector] = useState(false);

  useEffect(() => {
    if (!dialogOpen) {
      setIsRestConnector(false);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} setOpen={setDialogOpen}>
      <div className="bg-black p-5 w-100 text-white">
        {isRestConnector ? (
          <RestConnectorForm setDialogOpen={setDialogOpen} />
        ) : (
          <div className="flex gap-5 flex-col">
            {Object.entries(Connectors).map(([key, connector]) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'rest') {
                    // show form so that we can get an authentication token before 'connecting'
                    setIsRestConnector(true);
                  } else {
                    connect(connector);
                    setDialogOpen(false);
                  }
                }}
              >
                {key} provider
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
