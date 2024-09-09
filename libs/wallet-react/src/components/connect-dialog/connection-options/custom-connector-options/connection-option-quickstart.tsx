import { useState } from 'react';
import { QuickStartConnector } from '@vegaprotocol/wallet';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../../../hooks/use-t';
import { ConnectionOptionButton } from '../connection-option-button';
import { ConnectorIcon } from '../connector-icon';
import { useAccount, useChainId } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { useCreateDerivedWallet } from './use-derived-wallet';
import { type ConnectionOptionProps } from '../types';

export const QuickstartButton = ({
  connector,
  onClick,
  wasConnected,
}: {
  connector: QuickStartConnector;
  onClick: () => void;
  wasConnected: boolean;
}) => {
  const t = useT();
  const { isConnected, address } = useAccount();
  if (!isConnected || !address) {
    throw new Error('Tried to render QuickStartButton without an account');
  }
  const chainId = useChainId();
  const { isLoading, isError, refetch } = useCreateDerivedWallet(
    chainId,
    connector,
    address,
    !wasConnected
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
  const [wasConnected] = useState(isConnected);
  return !isConnected || !address ? (
    <ConnectEthereumQuickstartButton />
  ) : (
    <QuickstartButton
      wasConnected={wasConnected}
      connector={connector}
      onClick={onClick}
    />
  );
};
