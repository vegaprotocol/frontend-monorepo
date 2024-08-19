import { useT } from '../../lib/use-t';
import { Links, Routes } from '../../lib/links';
import { cn } from '@vegaprotocol/ui-toolkit';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

export const Assets = () => {
  const navigate = useNavigate();
  const t = useT();

  const title = useTitle();

  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    return cn('border-b-2 border-transparent', {
      'border-vega-yellow': isActive,
    });
  };

  return (
    <div className="max-w-[600px] p-4 mx-auto">
      <div className="lg:hidden py-2">
        <TradingDropdown
          trigger={
            <TradingDropdownTrigger>
              <button className="flex items-center gap-2">
                {title} <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
              </button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownContent>
            <TradingDropdownItem onClick={() => navigate(Links.DEPOSIT())}>
              {t('Deposit')}
            </TradingDropdownItem>
            <TradingDropdownItem
              onClick={() => navigate(Links.DEPOSIT_CROSS_CHAIN())}
            >
              {t('Deposit (cross chain)')}
            </TradingDropdownItem>
            <TradingDropdownItem onClick={() => navigate(Links.WITHDRAW())}>
              {t('Withdraw')}
            </TradingDropdownItem>
            <TradingDropdownItem onClick={() => navigate(Links.TRANSFER())}>
              {t('Transfer')}
            </TradingDropdownItem>
            <TradingDropdownItem onClick={() => navigate(Links.SWAP())}>
              {t('Swap')}
            </TradingDropdownItem>
          </TradingDropdownContent>
        </TradingDropdown>
      </div>
      <nav className="hidden lg:flex mb-6 text-lg gap-4">
        <NavLink to={Links.DEPOSIT()} className={linkClasses}>
          {t('Deposit')}
        </NavLink>
        <NavLink to={Links.DEPOSIT_CROSS_CHAIN()} className={linkClasses}>
          {t('Deposit (cross chain)')}
        </NavLink>
        <NavLink to={Links.WITHDRAW()} className={linkClasses}>
          {t('Withdraw')}
        </NavLink>
        <NavLink to={Links.TRANSFER()} className={linkClasses}>
          {t('Transfer')}
        </NavLink>
        <NavLink to={Links.SWAP()} className={linkClasses}>
          {t('Swap')}
        </NavLink>
      </nav>
      <div className="pt-4 border-t md:p-6 md:border md:rounded-xl border-gs-300 dark:border-gs-700">
        <Outlet />
      </div>
    </div>
  );
};

const useTitle = () => {
  const t = useT();
  const { pathname } = useLocation();

  if (pathname === Routes.DEPOSIT) {
    return t('Deposit');
  }

  if (pathname === Routes.DEPOSIT_CROSS_CHAIN) {
    return t('Deposit (cross chain)');
  }

  if (pathname === Routes.WITHDRAW) {
    return t('Withdraw');
  }

  if (pathname === Routes.TRANSFER) {
    return t('Transfer');
  }

  if (pathname === Routes.SWAP) {
    return t('Swap');
  }
};
