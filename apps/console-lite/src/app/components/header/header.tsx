import React, { useContext } from 'react';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import Logo from './logo';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import LocalContext from '../../context/local-context';

const Header = () => {
  const { updateVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    updateVegaWalletDialog: store.updateVegaWalletDialog,
  }));
  const {
    vegaWalletDialog: { setManage },
  } = useContext(LocalContext);
  return (
    <div
      className="dark flex items-stretch pr-6 py-6 bg-black text-neutral-400"
      data-testid="header"
    >
      <Logo />
      <div className="flex items-center gap-2 ml-auto relative z-10">
        <VegaWalletConnectButton
          setConnectDialog={updateVegaWalletDialog}
          setManageDialog={setManage}
        />
        <ThemeSwitcher className="-my-4" />
      </div>
    </div>
  );
};

export default Header;
