import { ConnectDialog, useDialogStore } from '@vegaprotocol/wallet-react';

export const VegaWalletConnectDialog = () => {
  const open = useDialogStore((store) => store.isOpen);
  const setDialog = useDialogStore((store) => store.set);

  return <ConnectDialog open={open} onChange={setDialog} />;
};
