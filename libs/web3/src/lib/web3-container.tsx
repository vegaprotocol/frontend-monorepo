import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { AsyncRenderer, Button, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { Web3Provider } from './web3-provider';
import { useEthereumConfig } from './use-ethereum-config';
import { useWeb3ConnectStore } from './web3-connect-store';
import { createConnectors } from './web3-connectors';
import { getChainName } from './constants';

interface Web3ContainerProps {
  children: ReactNode;
  childrenOnly?: boolean;
  connectEagerly?: boolean;
}

export const Web3Container = ({
  children,
  childrenOnly,
  connectEagerly,
}: Web3ContainerProps) => {
  const { config, loading, error } = useEthereumConfig();
  const { ETHEREUM_PROVIDER_URL, ETH_LOCAL_PROVIDER_URL, ETH_WALLET_MNEMONIC } =
    useEnvironment();
  const connectors = useMemo(() => {
    if (config?.chain_id) {
      return createConnectors(
        ETHEREUM_PROVIDER_URL,
        Number(config?.chain_id),
        ETH_LOCAL_PROVIDER_URL,
        ETH_WALLET_MNEMONIC
      );
    }
    return null;
  }, [
    config?.chain_id,
    ETHEREUM_PROVIDER_URL,
    ETH_LOCAL_PROVIDER_URL,
    ETH_WALLET_MNEMONIC,
  ]);
  return (
    <AsyncRenderer data={config} loading={loading} error={error}>
      {connectors && config && (
        <Web3Provider connectors={connectors}>
          <Web3Content
            connectEagerly={connectEagerly}
            childrenOnly={childrenOnly}
            appChainId={Number(1)}
            connectors={connectors}
          >
            {children}
          </Web3Content>
        </Web3Provider>
      )}
    </AsyncRenderer>
  );
};

interface Web3ContentProps {
  children: ReactNode;
  childrenOnly?: boolean;
  connectEagerly?: boolean;
  appChainId: number;
  connectors: ReturnType<typeof createConnectors>;
}

export const Web3Content = ({
  children,
  childrenOnly,
  connectEagerly,
  appChainId,
  connectors,
}: Web3ContentProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();
  const openDialog = useWeb3ConnectStore((state) => state.open);

  useEffect(() => {
    if (
      connector?.connectEagerly &&
      (!('Cypress' in window) || connectEagerly)
    ) {
      connector.connectEagerly();
    }
    // wallet connect doesnt handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (childrenOnly) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  if (error) {
    return (
      <SplashWrapper>
        <p className="mb-4">{t(`Something went wrong: ${error.message}`)}</p>
        <Button onClick={() => connector.deactivate()}>
          {t('Disconnect')}
        </Button>
      </SplashWrapper>
    );
  }

  if (!isActive) {
    return (
      <SplashWrapper>
        <p data-testid="connect-eth-wallet-msg" className="mb-4">
          {t('Connect your Ethereum wallet')}
        </p>
        <Button onClick={openDialog} data-testid="connect-eth-wallet-btn">
          {t('Connect')}
        </Button>
      </SplashWrapper>
    );
  }

  if (chainId !== appChainId) {
    return (
      <SplashWrapper>
        <p className="mb-4">
          {t(`This app only works on ${getChainName(appChainId)}`)}
        </p>
        <Button onClick={() => connector.deactivate()}>
          {t('Disconnect')}
        </Button>
      </SplashWrapper>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

interface SplashWrapperProps {
  children: ReactNode;
}

const SplashWrapper = ({ children }: SplashWrapperProps) => {
  return (
    <Splash>
      <div className="text-center">{children}</div>
    </Splash>
  );
};
