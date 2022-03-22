import { Web3Provider, Web3ConnectDialog } from '@vegaprotocol/web3';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Connectors } from '../../lib/web3-connectors';

interface Web3ContainerProps {
  children: (params: {
    dialogOpen: boolean;
    setDialogOpen: (isOpen: boolean) => void;
  }) => ReactNode;
}

export const Web3Container = ({ children }: Web3ContainerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Web3Provider connectors={Connectors}>
      <>
        {children({
          dialogOpen,
          setDialogOpen,
        })}
      </>
      <Web3ConnectDialog
        connectors={Connectors}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        desiredChainId={Number(process.env['NX_ETHEREUM_CHAIN_ID'] || 3)}
      />
    </Web3Provider>
  );
};
