import { t } from '@vegaprotocol/i18n';
import { Links } from '../../lib/links';
import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';

export const Transact = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    return classNames('border-b-2 border-transparent', {
      'border-vega-yellow': isActive,
    });
  };

  return (
    <div className="max-w-[500px] px-4 mx-auto my-8">
      <nav className="flex mb-6 text-lg gap-4">
        <NavLink to={Links.DEPOSIT()} className={linkClasses}>
          {t('Deposit')}
        </NavLink>
        <NavLink to={Links.WITHDRAW()} className={linkClasses}>
          {t('Withdraw')}
        </NavLink>
        <NavLink to={Links.TRANSFER()} className={linkClasses}>
          {t('Transfer')}
        </NavLink>
      </nav>
      <div className="pt-4 border-t md:p-6 md:border md:rounded-xl border-default">
        <Outlet />
      </div>
    </div>
  );
};
