import { useT } from '../../lib/use-t';
import { Links, Routes } from '../../lib/links';
import { cn } from '@vegaprotocol/ui-toolkit';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

export const Assets = () => {
  const navigate = useNavigate();
  const t = useT();

  const title = useTitle();

  const linkClasses = ({ isActive }: { isActive: boolean }) => {
    return cn('border-b-2 border-transparent', {
      'border-yellow': isActive,
    });
  };

  return (
    <div className="max-w-[600px] p-4 mx-auto">
      <div className="lg:hidden py-2">
        <DropdownMenu
          trigger={
            <DropdownMenuTrigger>
              <button className="flex items-center gap-2">
                {title} <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
              </button>
            </DropdownMenuTrigger>
          }
        >
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => navigate(Links.DEPOSIT())}>
              {t('Deposit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(Links.WITHDRAW())}>
              {t('Withdraw')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(Links.TRANSFER())}>
              {t('Transfer')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(Links.SWAP())}>
              {t('Swap')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="hidden lg:flex mb-6 text-lg gap-4">
        <NavLink to={Links.DEPOSIT()} className={linkClasses}>
          {t('Deposit')}
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
