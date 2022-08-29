import React, { useContext } from 'react';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import Logo from './logo';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import LocalContext from '../../context/local-context';

const Header = () => {
  const {
    vegaWalletDialog: { setConnect, setManage },
    theme,
    toggleTheme,
  } = useContext(LocalContext);
  return (
    <div
      className="flex items-stretch pr-6 py-6 bg-black text-neutral-400 border-b border-neutral-300 dark:border-neutral-700"
      data-testid="header"
    >
      <Logo />
      <div className="flex items-center gap-2 ml-auto relative z-10">
        <VegaWalletConnectButton
          setConnectDialog={setConnect}
          setManageDialog={setManage}
        />
        <ThemeSwitcher
          theme={theme}
          onToggle={toggleTheme}
          className="-my-4"
          fixedBg="dark"
        />
      </div>
    </div>
  );
};

export default Header;
