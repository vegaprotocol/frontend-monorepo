import { Button } from '@vegaprotocol/ui-toolkit';
import { useWeb3ConnectStore } from '@vegaprotocol/web3';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';

export const EthWalletContainer = ({
  children,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  children: ReactElement;
}) => {
  const { account } = useWeb3React();
  const open = useWeb3ConnectStore((store) => store.open);

  if (!account) {
    return (
      <div className="w-full text-center">
        <Button onClick={() => open()}>Connect Ethereum Wallet</Button>
      </div>
    );
  }

  return children;
};
