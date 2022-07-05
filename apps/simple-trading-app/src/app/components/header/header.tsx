import React from 'react';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import Logo from './logo';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';

type WalletParams = {
  connect: boolean;
  manage: boolean;
};

interface Props {
  setVegaWallet: (func: (wParams: WalletParams) => WalletParams) => void;
  toggleTheme: () => void;
}
const Header = ({ setVegaWallet, toggleTheme }: Props) => {
  return (
    <div
      className="flex items-stretch pr-16 py-16 bg-black text-white-60"
      data-testid="header"
    >
      <Logo />
      <div className="flex items-center gap-4 ml-auto mr-8 relative z-10">
        <VegaWalletConnectButton
          setConnectDialog={(open) =>
            setVegaWallet((x) => ({ ...x, connect: open }))
          }
          setManageDialog={(open) =>
            setVegaWallet((x) => ({ ...x, manage: open }))
          }
        />
        <ThemeSwitcher
          onToggle={toggleTheme}
          className="-my-4"
          sunClassName="text-white"
        />
      </div>
    </div>
  );
};

export default Header;
