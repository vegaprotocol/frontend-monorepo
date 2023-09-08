import { t } from '@vegaprotocol/i18n';
import classNames from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';

export const Transact = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    return classNames('border-b-2 border-transparent', {
      'border-vega-yellow': isActive,
    });
  };

  return (
    <div className="container px-4 mx-auto my-8">
      <nav className="flex mb-6 text-lg gap-4">
        <NavLink to="deposit" className={linkClasses}>
          {t('Deposit')}
        </NavLink>
        <NavLink to="withdraw" className={linkClasses}>
          {t('Withdraw')}
        </NavLink>
        <NavLink to="transfer" className={linkClasses}>
          {t('Transfer')}
        </NavLink>
      </nav>
      <div className="pt-4 border-t lg:w-2/3 xl:w-1/2 lg:p-6 lg:border lg:rounded-xl border-default">
        <Outlet />
      </div>
    </div>
  );
};
