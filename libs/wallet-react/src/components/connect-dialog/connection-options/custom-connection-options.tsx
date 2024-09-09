import { type FunctionComponent } from 'react';
import {
  type Connector,
  isBrowserWalletInstalled,
  QuickStartConnector,
  type ConnectorType,
} from '@vegaprotocol/wallet';
import { Button, Intent, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../hooks/use-t';
import { Links } from '../../../constants';
import { useUserAgent } from '@vegaprotocol/react-helpers';
import {
  ConnectionOptionButton,
  ConnectionOptionButtonWithDescription,
} from './connection-option-button';
import {
  ConnectionOptionLink,
  ConnectionOptionLinkWithDescription,
} from './connection-option-link';
import { ConnectorIcon } from './connector-icon';
import { useAccount, useChainId, useSignTypedData } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { ConnectKitButton } from 'connectkit';

const vegaExtensionsLinks = {
  chrome: Links.chromeExtension,
  firefox: Links.mozillaExtension,
} as const;

interface ConnectionOptionProps {
  id: ConnectorType;
  name: string;
  description: string;
  showDescription?: boolean;
  onClick: () => void;
  onInstall?: () => void;
  connector: Connector;
}

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
      <ConnectionOptionButtonWithDescription
        icon={<ConnectorIcon id={id} />}
        onClick={onClick}
      >
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-surface-0-fg-muted text-sm">{description}</span>
        </span>
      </ConnectionOptionButtonWithDescription>
    ) : (
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

/**
 * Derives a mnemonic from the user's connected Ethereum wallet
 */
export const useSignMessage = (
  chainId: number,
  connector: QuickStartConnector,
  address: string
) => {
  const { signTypedDataAsync } = useSignTypedData();
  return useQuery({
    enabled: false,
    retryOnMount: false,
    retry: false,
    queryKey: ['ethereum.signTypedData', chainId, address],
    queryFn: async () => {
      try {
        const signedMessage = await signTypedDataAsync({
          domain: { name: 'Vega', chainId: BigInt(chainId) },
          message: { action: 'Vega Onboarding' },
          primaryType: 'Vega',
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'chainId', type: 'uint256' },
            ],
            Vega: [{ name: 'action', type: 'string' }],
          },
        });
        const mnemonic = (await connector.deriveMnemonic(
          signedMessage
        )) as unknown as string[];
        const mnemonicString = mnemonic.join(' ');
        await connector.importWallet(mnemonicString);
      } catch (e) {
        const err = e as Error;
        if ('code' in err && err.code === 4001) {
          throw new Error('User denied message signature');
        }
        throw e;
      }
    },
  });
};

export const QuickstartButton = ({
  connector,
  onClick,
}: {
  connector: QuickStartConnector;
  onClick: () => void;
}) => {
  const t = useT();
  const { isConnected, address } = useAccount();
  if (!isConnected || !address) {
    throw new Error('Tried to render QuickStartButton without an account');
  }
  const chainId = useChainId();
  const { isLoading, isError, refetch } = useSignMessage(
    chainId,
    connector,
    address
  );
  return (
    <ConnectionOptionButton
      icon={<ConnectorIcon id="embedded-wallet-quickstart" />}
      id="embedded-wallet-quickstart"
      onClick={async () => {
        await refetch();
        onClick();
      }}
      disabled={isLoading || isError}
    >
      {t('Quickstart')}
    </ConnectionOptionButton>
  );
};

export const ConnectEthereumQuickstartButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ show }) => {
        return (
          <Button
            intent={Intent.Primary}
            onClick={() => {
              if (show) show();
              // eslint-disable-next-line no-console
              console.log('Next thing');
            }}
          >
            Connect Ethereum Wallet
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export const ConnectionOptionQuickstart = ({
  connector,
  onClick,
}: ConnectionOptionProps) => {
  if (!(connector instanceof QuickStartConnector)) {
    throw new Error('Tried to render QuickStartConnector with wrong connector');
  }
  const { isConnected, address } = useAccount();
  return !isConnected || !address ? (
    <ConnectEthereumQuickstartButton />
  ) : (
    <QuickstartButton connector={connector} onClick={onClick} />
  );
};

export const ConnectionOptionRecord: {
  [C in ConnectorType]?: FunctionComponent<ConnectionOptionProps>;
} = {
  injected: ConnectionOptionInjected,
  'embedded-wallet-quickstart': ConnectionOptionQuickstart,
};
