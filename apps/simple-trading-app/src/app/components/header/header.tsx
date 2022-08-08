import React, { useContext } from 'react';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import Logo from './logo';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import LocalContext from '../../context/local-context';

interface Props {
  toggleTheme: () => void;
}
const Header = ({ toggleTheme }: Props) => {
  const {
    vegaWalletDialog: { setConnect, setManage },
  } = useContext(LocalContext);
  return (
    <div
      className="flex items-stretch pr-16 py-16 bg-black text-white-60"
      data-testid="header"
    >
      <Logo />
      <div className="flex items-center gap-4 ml-auto mr-8 relative z-10">
        <VegaWalletConnectButton
          setConnectDialog={setConnect}
          setManageDialog={setManage}
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
