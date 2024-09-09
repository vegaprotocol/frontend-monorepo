import { type Connector, type ConnectorType } from '@vegaprotocol/wallet';
import { ConnectionOptionRecord } from '../custom-connector-options';
import { ConnectionOptionDefault } from '../connection-option-default';

export const ProminentConnectorsList = ({
  onConnect,
  setIsInstalling,
  connectors,
}: {
  onConnect: (id: ConnectorType) => void;
  setIsInstalling: (isInstalling: boolean) => void;
  connectors: Connector[];
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
      {connectors
        .filter((c) => c.prominent)
        .map((c) => {
          const ConnectionOption = ConnectionOptionRecord[c.id];
          const props = {
            id: c.id,
            name: c.name,
            description: c.description,
            showDescription: false,
            onClick: () => onConnect(c.id),
            onInstall: () => setIsInstalling(true),
            connector: c,
          };

          if (ConnectionOption) {
            return (
              <li key={c.id}>
                <ConnectionOption {...props} />
              </li>
            );
          }

          return (
            <li key={c.id}>
              <ConnectionOptionDefault {...props} />
            </li>
          );
        })}
    </div>
  );
};
