import { ConnectorError, QuickStartConnector } from '@vegaprotocol/wallet';
import { useT } from '../../../../hooks/use-t';
import { ConnectionOptionButton } from '../connection-option-button';
import { ConnectorIcon } from '../connector-icon';
import { type ConnectionOptionProps } from '../types';
import { useQuickstart } from 'libs/wallet-react/src/hooks/use-quickstart';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';
import { useConfig } from '@vegaprotocol/wallet-react';

const USER_REJECTED_CODE = 4001;

export const QuickstartButton = ({
  onClick,
  isPending,
  error,
}: {
  onClick: () => void;
  isPending: boolean;
  error: ConnectorError | null;
}) => {
  const t = useT();

  return (
    <>
      <ConnectionOptionButton
        icon={<ConnectorIcon id="embedded-wallet-quickstart" />}
        id="embedded-wallet-quickstart"
        onClick={onClick}
        disabled={isPending}
      >
        {t('Connect with Ethereum')}
      </ConnectionOptionButton>
      {error &&
        error instanceof ConnectorError &&
        error.code !== USER_REJECTED_CODE && (
          <p
            className="text-intent-danger text-sm first-letter:uppercase"
            data-testid="connection-error"
          >
            {error.message}
            {error.data ? `: ${error.data}` : ''}
          </p>
        )}
    </>
  );
};

export const ConnectionOptionQuickstartWagmi = ({
  connector,
  onClick,
}: ConnectionOptionProps) => {
  if (!(connector instanceof QuickStartConnector)) {
    throw new Error('Tried to render QuickStartConnector with wrong connector');
  }
  const { createWallet, isPending, error } = useQuickstart({
    connector,
    onSuccess: () => onClick(),
  });

  return (
    <QuickstartButton
      onClick={createWallet}
      isPending={isPending}
      error={error as ConnectorError}
    />
  );
};

// TODO change to 1!!!!
export const ETHEREUM_CHAIN_ID = 11155111;

export const ConnectionOptionQuickstart = ({
  connector,
  onClick,
}: ConnectionOptionProps) => {
  const t = useT();
  if (!(connector instanceof QuickStartConnector)) {
    throw new Error('Tried to render QuickStartConnector with wrong connector');
  }
  const state = useConfig();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { open } = useWeb3ConnectStore();
  const { account, connector: ethConnector } = useWeb3React();
  const createWallet = useCallback(async () => {
    try {
      setError(null);
      state.store.setState({
        status: 'creating',
      });
      const { chainId } = await connector.getChainId();
      if (chainId !== ETHEREUM_CHAIN_ID.toString()) {
        await ethConnector.activate(ETHEREUM_CHAIN_ID);
      }
      const signedMessage = await ethConnector.provider?.request({
        method: 'eth_signTypedData_v4',
        params: [
          account,
          {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'chainId', type: 'uint256' },
              ],
              Onboarding: [{ name: 'action', type: 'string' }],
            },
            primaryType: 'Onboarding',
            domain: { name: 'Onboarding', chainId: ETHEREUM_CHAIN_ID },
            message: { action: `${state.appName} Onboarding` },
          },
        ],
      });
      const mnemonic = (await connector.deriveMnemonic(
        signedMessage as unknown as string
      )) as unknown as string[];
      const mnemonicString = mnemonic.join(' ');
      await connector.importWallet(mnemonicString, account!);
      onClick();
    } catch (e) {
      state.store.setState({
        status: 'disconnected',
      });
      setError(e as Error);
    }
  }, [ethConnector, state, account]);
  const clickHandler = () => {
    if (!account) {
      open(ETHEREUM_CHAIN_ID);
      setIsCreating(true);
    } else {
      createWallet();
    }
  };

  // TODO this is reacting to a change of state which is not pleasant
  useEffect(() => {
    if (account && isCreating) {
      createWallet();
    }
  }, [account, isCreating]);

  return (
    <>
      <ConnectionOptionButton
        icon={<ConnectorIcon id="embedded-wallet-quickstart" />}
        id="embedded-wallet-quickstart"
        onClick={clickHandler}
        disabled={false}
      >
        {t('Connect with Ethereum')}
      </ConnectionOptionButton>
      {error &&
        error instanceof ConnectorError &&
        error.code !== USER_REJECTED_CODE && (
          <p
            className="text-intent-danger text-sm first-letter:uppercase"
            data-testid="connection-error"
          >
            {error.message}
            {error.data ? `: ${error.data}` : ''}
          </p>
        )}
    </>
  );
};
