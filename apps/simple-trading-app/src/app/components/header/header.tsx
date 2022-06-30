import React from 'react';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import Video from './video';
import Logo from './logo';
import Comet from './comet';
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
    <div className="flex items-stretch p-16 bg-black dark:bg-white text-white-60">
      <div className="absolute top-0 right-[200px] w-[500px] h-[100px] z-0 hidden md:block">
        <Video />
        <div
          id="swarm"
          className="absolute w-[500px] h-[100px] bg-black dark:bg-white"
        />
      </div>
      <Logo />
      <Comet />
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
