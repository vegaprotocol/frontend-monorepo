import type { ReactNode } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { AsyncRenderer, Button, Splash } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { Web3Provider } from './web3-provider';
import { useEthereumConfig } from './use-ethereum-config';
import { Web3ConnectDialog } from './web3-connect-dialog';
import { createConnectors } from './web3-connectors';

interface Web3ContainerProps {
  children: ReactNode;
}

export const Web3Container = ({ children }: Web3ContainerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { config, loading, error } = useEthereumConfig();
  const { ETHEREUM_PROVIDER_URL } = useEnvironment();
  const Connectors = useMemo(() => {
    if (config?.chain_id) {
      return createConnectors(ETHEREUM_PROVIDER_URL, Number(config?.chain_id));
    }
    return null;
  }, [config?.chain_id, ETHEREUM_PROVIDER_URL]);
  return (
    <AsyncRenderer data={config} loading={loading} error={error}>
      {Connectors && config && (
        <Web3Provider connectors={Connectors}>
          <Web3Content
            appChainId={Number(config.chain_id)}
            setDialogOpen={setDialogOpen}
          >
            {children}
          </Web3Content>
          <Web3ConnectDialog
            connectors={Connectors}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            desiredChainId={Number(config.chain_id)}
          />
        </Web3Provider>
      )}
    </AsyncRenderer>
  );
};

interface Web3ContentProps {
  children: ReactNode;
  appChainId: number;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Content = ({
  children,
  appChainId,
  setDialogOpen,
}: Web3ContentProps) => {
  const { isActive, error, connector, chainId } = useWeb3React();

  useEffect(() => {
    if (connector?.connectEagerly && !('Cypress' in window)) {
      connector.connectEagerly();
    }
    // wallet connect doesnt handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Button
          onClick={() => setDialogOpen(true)}
          data-testid="connect-eth-wallet-btn"
        >
          {t('Connect')}
        </Button>
      </SplashWrapper>
    );
  }

  if (chainId !== appChainId) {
    return (
      <SplashWrapper>
        <p className="mb-4">
          {t(`This app only works on chain ID: ${appChainId}`)}
        </p>
        <Button onClick={() => connector.deactivate()}>
          {t('Disconnect')}
        </Button>
      </SplashWrapper>
    );
  }

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
