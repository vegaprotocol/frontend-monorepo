import {
  ConnectorErrors,
  isBrowserWalletInstalled,
  type ConnectorType,
} from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../hooks/use-t';
import { useWallet } from '../../hooks/use-wallet';
import { useConnect } from '../../hooks/use-connect';
import { Links } from '../../constants';
import { ConnectorIcon } from './connector-icon';
import { useUserAgent } from '@vegaprotocol/react-helpers';

const extensionLinks = {
  chrome: Links.chromeExtension,
  firefox: Links.mozillaExtension,
} as const;

export const ConnectionOptions = ({
  onConnect,
}: {
  onConnect: (id: ConnectorType) => void;
}) => {
  const t = useT();
  const error = useWallet((store) => store.error);
  const { connectors } = useConnect();

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-xl">{t('Connect to Vega')}</h2>
      <ul
        className="grid grid-cols-2 gap-1 -mx-2"
        data-testid="connectors-list"
      >
        {connectors.map((c) => {
          if (c.id === 'injected') {
            return (
              <li key={c.id}>
                <ConnectionOptionInjected
                  id={c.id}
                  name={c.name}
                  description={c.description}
                  onClick={() => onConnect(c.id)}
                />
              </li>
            );
          }

          return (
            <li key={c.id}>
              <ConnectionOption
                id={c.id}
                name={c.name}
                description={c.description}
                onClick={() => onConnect(c.id)}
              />
            </li>
          );
        })}
      </ul>
      {error && error.code !== ConnectorErrors.userRejected.code && (
        <p
          className="text-danger text-sm first-letter:uppercase"
          data-testid="connection-error"
        >
          {error.message}
        </p>
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

export const ConnectionOption = ({
  id,
  name,
  description,
  onClick,
}: {
  id: ConnectorType;
  name: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      <button
        className="w-full flex gap-2 items-center p-2 rounded capitalize hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800"
        onClick={onClick}
        data-testid={`connector-${id}`}
      >
        <ConnectorIcon id={id} />
        {name}
      </button>
    </Tooltip>
  );
};

/**
 * This component is specific for the Vega wallet connection option,
 * if its not installed we want to link to the extension url
 */
export const ConnectionOptionInjected = ({
  id,
  name,
  description,
  onClick,
}: {
  id: 'injected';
  name: string;
  description: string;
  onClick: () => void;
}) => {
  const t = useT();
  const userAgent = useUserAgent();
  const link = userAgent ? extensionLinks[userAgent] : Links.walletOverview;

  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      {isBrowserWalletInstalled() ? (
        <button
          className="w-full flex gap-2 items-center p-2 rounded capitalize hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800"
          onClick={onClick}
          data-testid={`connector-${id}`}
        >
          <ConnectorIcon id={id} />
          {name}
        </button>
      ) : (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="w-full flex gap-2 items-center p-2 rounded capitalize hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800"
          data-testid={`connector-${id}`}
        >
          <ConnectorIcon id={id} />
          {t('Get the Vega Wallet')}
        </a>
      )}
    </Tooltip>
  );
};
