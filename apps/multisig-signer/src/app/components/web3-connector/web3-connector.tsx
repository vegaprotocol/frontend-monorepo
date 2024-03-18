import type { ReactElement } from 'react';
import {
  Web3ConnectUncontrolledDialog,
  getChainName,
  useEagerConnect,
  useEthereumConfig,
  useWeb3Disconnect,
} from '@vegaprotocol/web3';
import { Button, Splash, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../../config/web3-connectors';

interface Web3ConnectorProps {
  children: ReactElement;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export function Web3Connector({ children }: Web3ConnectorProps) {
  const { config, loading, error } = useEthereumConfig();
  const appChainId = Number(config?.chain_id);
  return (
    <AsyncRenderer loading={loading} error={error} data={config}>
      <Web3Content appChainId={appChainId}>{children}</Web3Content>
      <Web3ConnectUncontrolledDialog connectors={connectors} />
    </AsyncRenderer>
  );
}

interface Web3ContentProps {
  children: ReactElement;
  appChainId: number;
}

export const Web3Content = ({ children, appChainId }: Web3ContentProps) => {
  const { chainId } = useWeb3React();
  const disconnect = useWeb3Disconnect();

  useEagerConnect({ connectors });

  // TODO: check error from  web3 connect store
  // if (error) {
  //   return (
  //     <Splash>
  //       <div className="flex flex-col items-center gap-12">
  //         <Button onClick={() => disconnect()}>Disconnect</Button>
  //       </div>
  //     </Splash>
  //   );
  // }

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
