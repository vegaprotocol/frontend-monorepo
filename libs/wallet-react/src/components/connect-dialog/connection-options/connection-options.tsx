import { useState } from 'react';
import {
  type Connector,
  ConnectorErrors,
  type ConnectorType,
} from '@vegaprotocol/wallet';
import {
  Accordion,
  AccordionItem,
  DialogTitle,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../hooks/use-t';
import { useWallet } from '../../../hooks/use-wallet';
import { useConnect } from '../../../hooks/use-connect';
import { Links } from '../../../constants';
import { Trans } from 'react-i18next';
import { ConnectionOptionRecord } from './custom-connection-options';
import { ConnectionOptionDefault } from './connection-option-default';
import { ConnectionOptionDeemphasizedDefault } from './connection-option-deemphasized-default';

const ProminentConnectors = ({
  onConnect,
  setIsInstalling,
  connectors,
}: {
  onConnect: (id: ConnectorType) => void;
  setIsInstalling: (isInstalling: boolean) => void;
  connectors: Connector[];
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 -mx-2">
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

export const AdvancedConnectionOptions = ({
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

export const ConnectionOptions = ({
  onConnect,
}: {
  onConnect: (id: ConnectorType) => void;
}) => {
  const t = useT();
  const { connectors } = useConnect();
  const error = useWallet((store) => store.error);
  const [isInstalling, setIsInstalling] = useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <DialogTitle>{t('Connect to Vega')}</DialogTitle>
      {isInstalling ? (
        <p className="text-warning">
          <Trans
            i18nKey="Once you have added the extension, <0>refresh</0> your browser."
            components={[
              <button
                onClick={() => window.location.reload()}
                className="underline underline-offset-4"
              />,
            ]}
          />
        </p>
      ) : (
        <>
          <ul className="w-full" data-testid="connectors-list">
            <ProminentConnectors
              {...{ onConnect, setIsInstalling, connectors }}
            />
            <AdvancedConnectionOptions
              {...{ onConnect, setIsInstalling, connectors }}
            />
          </ul>
          {error && error.code !== ConnectorErrors.userRejected.code && (
            <p
              className="text-intent-danger text-sm first-letter:uppercase"
              data-testid="connection-error"
            >
              {error.message}
              {error.data ? `: ${error.data}` : ''}
            </p>
          )}
        </>
      )}
      <a
        href={Links.walletOverview}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-4"
      >
        {t("Don't have a wallet?")}
      </a>
    </div>
  );
};
