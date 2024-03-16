import { useEnvironment } from '@vegaprotocol/environment';
import {
  getChainName,
  useEthereumConfig,
  useWeb3ConnectStore,
  useWeb3Disconnect,
} from '@vegaprotocol/web3';
import { Button, Splash, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { Web3ConnectDialog } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';
import { createConnectors } from '../../lib/web3-connectors';

interface Web3ConnectorProps {
  children: ReactElement;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export function Web3Connector({
  children,
  dialogOpen,
  setDialogOpen,
}: Web3ConnectorProps) {
  const { ETHEREUM_PROVIDER_URL } = useEnvironment();
  const { config, loading, error } = useEthereumConfig();
  const Connectors = useMemo(() => {
    if (config?.chain_id) {
      return createConnectors(ETHEREUM_PROVIDER_URL, Number(config.chain_id));
    }
    return undefined;
  }, [config?.chain_id, ETHEREUM_PROVIDER_URL]);
  const appChainId = Number(config?.chain_id);
  return (
    <AsyncRenderer loading={loading} error={error} data={config}>
      <Web3Content appChainId={appChainId} setDialogOpen={setDialogOpen}>
        {children}
      </Web3Content>
      {Connectors && (
        <Web3ConnectDialog
          connectors={Connectors}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          desiredChainId={appChainId}
        />
      )}
    </AsyncRenderer>
  );
}

interface Web3ContentProps {
  children: ReactElement;
  appChainId: number;
  setDialogOpen: (isOpen: boolean) => void;
}

export const Web3Content = ({
  children,
  appChainId,
  setDialogOpen,
}: Web3ContentProps) => {
  const { chainId } = useWeb3React();
  const error = useWeb3ConnectStore((store) => store.error);
  const disconnect = useWeb3Disconnect();

  useEffect(() => {
    if (connector?.connectEagerly) {
      connector.connectEagerly();
    }
    // wallet connect doesnt handle connectEagerly being called when connector is also in the
    // deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]);

  if (error) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="text-white">Something went wrong: {error.message}</p>
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  if (chainId !== undefined && chainId !== appChainId) {
    return (
      <Splash>
        <div className="flex flex-col items-center gap-12">
          <p className="text-white">
            This app only works on {getChainName(appChainId)}
          </p>
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </div>
      </Splash>
    );
  }

  return children;
};
