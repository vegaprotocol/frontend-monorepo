import { isBrowserWalletInstalled } from '@vegaprotocol/wallet';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../../hooks/use-t';
import { Links } from '../../../../constants';
import { useUserAgent } from '@vegaprotocol/react-helpers';
import {
  ConnectionOptionButton,
  ConnectionOptionButtonWithDescription,
} from '../connection-option-button';
import {
  ConnectionOptionLink,
  ConnectionOptionLinkWithDescription,
} from '../connection-option-link';
import { ConnectorIcon } from '../connector-icon';
import { type ConnectionOptionProps } from '../types';

const vegaExtensionsLinks = {
  chrome: Links.chromeExtension,
  firefox: Links.mozillaExtension,
} as const;

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
  const link = userAgent && vegaExtensionsLinks[userAgent];

  if (showDescription) {
    if (isBrowserWalletInstalled()) {
      return (
        <ConnectionOptionButtonWithDescription
          icon={<ConnectorIcon id={id} />}
          onClick={onClick}
        >
          <span className="flex flex-col justify-start text-left">
            <span className="capitalize leading-5">{name}</span>
            <span className="text-surface-0-fg-muted text-sm">
              {description}
            </span>
          </span>
        </ConnectionOptionButtonWithDescription>
      );
    }

    return (
      <ConnectionOptionLinkWithDescription
        icon={<ConnectorIcon id={id} />}
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
          <ConnectionOptionButton
            icon={<ConnectorIcon id={id} />}
            id={id}
            onClick={onClick}
          >
            {name}
          </ConnectionOptionButton>
        ) : (
          <ConnectionOptionLink
            icon={<ConnectorIcon id={id} />}
            id={id}
            href={link}
            onClick={onInstall}
          >
            {t('Get the Vega Wallet')}
          </ConnectionOptionLink>
        )}
      </span>
    </Tooltip>
  );
};
