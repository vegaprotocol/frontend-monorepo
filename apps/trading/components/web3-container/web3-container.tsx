import { gql } from '@apollo/client';
import { NetworkParametersQuery } from '@vegaprotocol/graphql';
import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { Web3Provider, Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Connectors } from '../../lib/web3-connectors';
import { PageQueryContainer } from '../page-query-container';

export interface EthereumConfig {
  network_id: string;
  chain_id: string;
  confirmations: number;
  collateral_bridge_contract: {
    address: string;
  };
  multisig_control_contract: {
    address: string;
    deployment_block_height: number;
  };
  staking_bridge_contract: {
    address: string;
    deployment_block_height: number;
  };
  token_vesting_contract: {
    address: string;
    deployment_block_height: number;
  };
}

export const NETWORK_PARAMS_QUERY = gql`
  query NetworkParamsQuery {
    networkParameters {
      key
      value
    }
  }
`;

interface Web3ContainerProps {
  children: (params: { ethereumConfig: EthereumConfig }) => ReactNode;
}

export const Web3Container = ({ children }: Web3ContainerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <PageQueryContainer<NetworkParametersQuery> query={NETWORK_PARAMS_QUERY}>
      {(data) => {
        const ethereumConfigParam = data.networkParameters.find(
          (np) => np.key === 'blockchains.ethereumConfig'
        );

        if (!ethereumConfigParam) {
          return (
            <Splash>
              <p>No ethereum config found</p>
            </Splash>
          );
        }

        let ethereumConfig: EthereumConfig;

        try {
          ethereumConfig = JSON.parse(ethereumConfigParam.value);
        } catch {
          return (
            <Splash>
              <p>Could not parse config</p>
            </Splash>
          );
        }

        return (
          <Web3Provider connectors={Connectors}>
            <Web3Content
              appChainId={Number(ethereumConfig.chain_id)}
              setDialogOpen={setDialogOpen}
            >
              {children({ ethereumConfig })}
            </Web3Content>
            <Web3ConnectDialog
              connectors={Connectors}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              desiredChainId={Number(ethereumConfig.chain_id)}
            />
          </Web3Provider>
        );
      }}
    </PageQueryContainer>
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
    connector?.connectEagerly();
  }, [connector]);

  if (error) {
    return (
      <SplashWrapper>
        <p className="mb-12">Something went wrong: {error.message}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
      </SplashWrapper>
    );
  }

  if (!isActive) {
    return (
      <SplashWrapper>
        <p className="mb-12">Connect your Ethereum wallet</p>
        <Button onClick={() => setDialogOpen(true)}>Connect</Button>
      </SplashWrapper>
    );
  }

  if (chainId !== appChainId) {
    return (
      <SplashWrapper>
        <p className="mb-12">This app only works on chain ID: {appChainId}</p>
        <Button onClick={() => connector.deactivate()}>Disconnect</Button>
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
