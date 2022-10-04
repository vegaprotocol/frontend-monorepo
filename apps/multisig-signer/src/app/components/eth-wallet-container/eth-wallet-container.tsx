import { Button } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import type { ReactElement } from 'react';

export const EthWalletContainer = ({
  dialogOpen,
  setDialogOpen,
  children,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  children: ReactElement;
}) => {
  const { account } = useWeb3React();
  if (!account) {
    return (
      <div className="w-full text-center">
        <Button onClick={() => setDialogOpen(true)}>
          Connect Ethereum Wallet
        </Button>
      </div>
    );
  }
  return children;
};
