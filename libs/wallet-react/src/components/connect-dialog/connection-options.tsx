import {
  type ReactNode,
  type FunctionComponent,
  forwardRef,
  useState,
} from 'react';
import {
  ConnectorErrors,
  isBrowserWalletInstalled,
  type ConnectorType,
  isMetaMaskInstalled,
} from '@vegaprotocol/wallet';
import {
  Accordion,
  AccordionItem,
  DialogTitle,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../hooks/use-t';
import { useWallet } from '../../hooks/use-wallet';
import { useConnect } from '../../hooks/use-connect';
import { Links } from '../../constants';
import { ConnectorIcon } from './connector-icon';
import { useUserAgent } from '@vegaprotocol/react-helpers';
import { Trans } from 'react-i18next';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 -mx-2">
              {connectors.map((c) => {
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
            <Accordion>
              <AccordionItem
                itemId="current-fees"
                title={t('Advanced options')}
                content={connectors.map((c) => {
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
              />
            </Accordion>
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

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
  onInstall?: () => void;
}

const CONNECTION_OPTION_CLASSES =
  'w-full flex gap-2 items-center p-2 rounded first-letter:capitalize hover:bg-surface-1';
const CONNECTION_OPTION_CLASSES_DESC =
  'w-full flex gap-2 items-start p-4 rounded first-letter:capitalize hover:bg-surface-1';

export const ConnectionOptionDefault = ({
  id,
  name,
  description,
  showDescription = false,
  onClick,
}: ConnectionOptionProps) => {
  if (showDescription) {
    return (
      <ConnectionOptionButtonWithDescription id={id} onClick={onClick}>
        <span className="flex flex-col justify-start text-left">
          <span className="first-letter:capitalize">{name}</span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionButtonWithDescription>
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
      <span>
        <ConnectionOptionButton id={id} onClick={onClick}>
          {name}
        </ConnectionOptionButton>
      </span>
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
  onInstall,
}: ConnectionOptionProps) => {
  const t = useT();
  const userAgent = useUserAgent();
  const link = userAgent
    ? vegaExtensionsLinks[userAgent]
    : Links.walletOverview;

  if (showDescription) {
    return isBrowserWalletInstalled() ? (
      <ConnectionOptionButtonWithDescription id={id} onClick={onClick}>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionButtonWithDescription>
    ) : (
      <ConnectionOptionLinkWithDescription
        id={id}
        href={link}
        onClick={onInstall}
      >
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">
            {t('Get the Vega Wallet')}
          </span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionLinkWithDescription>
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
      <span>
        {isBrowserWalletInstalled() ? (
          <ConnectionOptionButton id={id} onClick={onClick}>
            {name}
          </ConnectionOptionButton>
        ) : (
          <ConnectionOptionLink id={id} href={link} onClick={onInstall}>
            {t('Get the Vega Wallet')}
          </ConnectionOptionLink>
        )}
      </span>
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
      <ConnectionOptionButtonWithDescription id={id} onClick={onClick}>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionButtonWithDescription>
    ) : (
      <ConnectionOptionLinkWithDescription id={id} href={link}>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">
            {t('Get the Vega Wallet')}
          </span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionLinkWithDescription>
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
      <span>
        {isMetaMaskInstalled() ? (
          <ConnectionOptionButton id={id} onClick={onClick}>
            {name}
          </ConnectionOptionButton>
        ) : (
          <ConnectionOptionLink id={id} href={link}>
            {t('Get MetaMask')}
          </ConnectionOptionLink>
        )}
      </span>
    </Tooltip>
  );
};

const ConnectionOptionButton = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    id: ConnectorType;
    onClick: () => void;
  }
>(({ children, id, onClick }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES}
      onClick={onClick}
      data-testid={`connector-${id}`}
      ref={ref}
    >
      <ConnectorIcon id={id} />
      {children}
    </button>
  );
});

const ConnectionOptionLink = forwardRef<
  HTMLAnchorElement,
  {
    children: ReactNode;
    id: ConnectorType;
    href: string;
    onClick?: () => void;
  }
>(({ children, id, href, onClick }, ref) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={CONNECTION_OPTION_CLASSES}
      data-testid={`connector-${id}`}
      ref={ref}
      onClick={onClick}
    >
      <ConnectorIcon id={id} />
      {children}
    </a>
  );
});

const ConnectionOptionButtonWithDescription = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    id: ConnectorType;
    onClick: () => void;
  }
>(({ children, id, onClick }, ref) => {
  return (
    <button
      className={CONNECTION_OPTION_CLASSES_DESC}
      onClick={onClick}
      ref={ref}
    >
      <span>
        <ConnectorIcon id={id} />
      </span>
      {children}
    </button>
  );
});

const ConnectionOptionLinkWithDescription = forwardRef<
  HTMLAnchorElement,
  {
    children: ReactNode;
    id: ConnectorType;
    href: string;

    onClick?: () => void;
  }
>(({ children, id, href, onClick }, ref) => {
  return (
    <a
      ref={ref}
      className={CONNECTION_OPTION_CLASSES_DESC}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
    >
      <span>
        <ConnectorIcon id={id} />
      </span>
      {children}
    </a>
  );
});

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  snap: ConnectionOptionSnap,
};
