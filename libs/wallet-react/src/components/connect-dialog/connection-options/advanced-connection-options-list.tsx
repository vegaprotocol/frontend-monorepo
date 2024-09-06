import { type Connector, type ConnectorType } from '@vegaprotocol/wallet';
import { Accordion, AccordionItem } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../hooks/use-t';
import { ConnectionOptionDeemphasizedDefault } from './connection-option-deemphasized-default';

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
            const props = {
              id: c.id,
              name: c.name,
              description: c.description,
              onClick: () => onConnect(c.id),
              onInstall: () => setIsInstalling(true),
            };

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
