import { type Connector, type ConnectorType } from '@vegaprotocol/wallet';
import { Accordion, AccordionItem } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../../hooks/use-t';
import { ConnectionOptionDeemphasizedDefault } from '../connection-option-deemphasized-default';
import { ConnectionOptionRecord } from '../custom-connector-options';

export const AdvancedConnectionOptionsList = ({
  onConnect,
  setIsInstalling,
  connectors,
}: {
  onConnect: (id: ConnectorType) => void;
  setIsInstalling: (isInstalling: boolean) => void;
  connectors: Connector[];
}) => {
  const t = useT();

  return (
    <Accordion>
      <AccordionItem
        itemId="current-fees"
        title={t('Advanced connection options')}
        content={connectors
          .filter((c) => !c.prominent)
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
                <ConnectionOptionDeemphasizedDefault {...props} />
              </li>
            );
          })}
      />
    </Accordion>
  );
};
