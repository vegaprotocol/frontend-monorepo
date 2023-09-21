import { t } from '@vegaprotocol/i18n';
import { Links } from '../../lib/links';
import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { truncateByChars } from '@vegaprotocol/utils';
import { useWeb3ConnectStore, useWeb3Disconnect } from '@vegaprotocol/web3';

export const Assets = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    return classNames('border-b-2 border-transparent', {
      'border-vega-yellow': isActive,
    });
  };

  return (
    <div className="container px-4 mx-auto my-4">
      <nav className="flex items-end my-6 text-lg gap-4">
        <NavLink to={Links.DEPOSIT()} className={linkClasses}>
          {t('Deposit')}
        </NavLink>
        <NavLink to={Links.WITHDRAW()} className={linkClasses}>
          {t('Withdraw')}
        </NavLink>
        <NavLink to={Links.TRANSFER()} className={linkClasses}>
          {t('Transfer')}
        </NavLink>
        <div className="ml-auto">
          <EthereumConnect />
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

const EthereumConnect = () => {
  const { account, connector } = useWeb3React();
  const disconnect = useWeb3Disconnect(connector);
  const openDialog = useWeb3ConnectStore((store) => store.open);

  return (
    <div className="text-sm">
      {account ? (
        <div className="flex flex-col items-end">
          <p>{truncateByChars(account)}</p>
          <button onClick={disconnect} className="underline underline-offset-4">
            {t('Disconnect')}
          </button>
        </div>
      ) : (
        <button onClick={openDialog} className="underline underline-offset-4">
          {t('Connect Ethereum wallet')}
        </button>
      )}
    </div>
  );
};
