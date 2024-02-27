import { type FunctionComponent } from 'react';
import {
  ConnectorErrors,
  isBrowserWalletInstalled,
  type ConnectorType,
  isMetaMaskInstalled,
} from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../hooks/use-t';
import { useWallet } from '../../hooks/use-wallet';
import { useConnect } from '../../hooks/use-connect';
import { Links } from '../../constants';
import { ConnectorIcon } from './connector-icon';
import { useUserAgent } from '@vegaprotocol/react-helpers';

const vegaExtensionsLinks = {
  chrome: Links.chromeExtension,
  firefox: Links.mozillaExtension,
} as const;

const metaMaskExtensionsLinks = {
  chrome: Links.chromeMetaMaskExtension,
  firefox: Links.mozillaMetaMaskExtension,
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
          const ConnectionOption = ConnectionOptionRecord[c.id];
          const props = {
            id: c.id,
            name: c.name,
            description: c.description,
            showDescription: false,
            onClick: () => onConnect(c.id),
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

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
}

export const ConnectionOptionDefault = ({
  id,
  name,
  description,
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  if (showDescription) {
    return (
      <button
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        onClick={onClick}
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="first-letter:capitalize">{name}</span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </button>
    );
  }

  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      <button
        className="w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800"
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
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  const t = useT();
  const userAgent = useUserAgent();
  const link = userAgent
    ? vegaExtensionsLinks[userAgent]
    : Links.walletOverview;

  if (showDescription) {
    return isBrowserWalletInstalled() ? (
      <button
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        onClick={onClick}
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </button>
    ) : (
      <a
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        href={link}
        target="_blank"
        rel="noreferrer"
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">
            {t('Get the Vega Wallet')}
          </span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </a>
    );
  }

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

export const ConnectionOptionSnap = ({
  id,
  name,
  description,
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  const t = useT();
  const userAgent = useUserAgent();
  const link = userAgent
    ? metaMaskExtensionsLinks[userAgent]
    : Links.walletOverview;

  if (showDescription) {
    return isMetaMaskInstalled() ? (
      <button
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        onClick={onClick}
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </button>
    ) : (
      <a
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        href={link}
        target="_blank"
        rel="noreferrer"
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">
            {t('Get the Vega Wallet')}
          </span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </a>
    );
  }

  return (
    <Tooltip
      description={description}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={400}
    >
      {isMetaMaskInstalled() ? (
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
          {t('Get MetaMask')}
        </a>
      )}
    </Tooltip>
  );
};

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  snap: ConnectionOptionSnap,
};
