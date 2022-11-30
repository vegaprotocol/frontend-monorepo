import classNames from 'classnames';
import { NavLink, Link } from 'react-router-dom';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
// import { Vega } from '../icons/vega';
import type { HTMLAttributeAnchorTarget } from 'react';
// import testnetBg from '../../assets/green-cloud.png';
import Routes from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import vegaWhite from '../../images/vega_white.png';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

export const Nav = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const { t } = useTranslation();
  const themeWrapperClasses = classNames({
    dark: navbarTheme === 'dark',
  });

  const isYellow = navbarTheme === 'yellow';
  const navbarClasses = classNames(
    'flex items-stretch border-b px-4 border-default',
    {
      'dark:bg-black dark:text-white': !isYellow,
      'bg-vega-yellow text-black bg-right-top bg-no-repeat bg-contain':
        isYellow,
    }
  );

  return (
    <div className={themeWrapperClasses}>
      <div
        className={navbarClasses}
        style={
          {
            // backgroundImage: isYellow ? `url("${testnetBg.src}")` : '',
          }
        }
      >
        <div className="flex gap-4 items-center">
          <Link to="/">
            <img alt="Vega" src={vegaWhite} height={30} width={30} />
          </Link>
          <NetworkSwitcher />
        </div>
        <nav className="flex items-center flex-1 px-2">
          <AppNavLink
            name={t('Proposals')}
            path={Routes.PROPOSALS}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Validators')}
            path={Routes.VALIDATORS}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Rewards')}
            path={Routes.REWARDS}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Token')}
            path={Routes.TOKEN}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Redeem')}
            path={Routes.REDEEM}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Withdraw')}
            path={Routes.WITHDRAWALS}
            navbarTheme={navbarTheme}
          />
          <AppNavLink
            name={t('Supply & Vesting')}
            path={Routes.TRANCHES}
            navbarTheme={navbarTheme}
          />
        </nav>
      </div>
    </div>
  );
};

interface AppNavLinkProps {
  name: string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  alignRight?: boolean;
  target?: HTMLAttributeAnchorTarget;
}

const AppNavLink = ({
  name,
  path,
  navbarTheme,
  alignRight,
  target,
  testId = name,
}: AppNavLinkProps) => {
  const borderClasses = classNames('absolute h-1 w-full bottom-[-1px] left-0', {
    'bg-black dark:bg-vega-yellow': navbarTheme !== 'yellow',
    'bg-black': navbarTheme === 'yellow',
  });
  return (
    <NavLink
      data-testid={testId}
      to={{ pathname: path }}
      className={getNavLinkClassNames(navbarTheme, alignRight)}
      target={target}
    >
      {({ isActive }) => {
        return (
          <>
            {name}
            {isActive && <span className={borderClasses} />}
          </>
        );
      }}
    </NavLink>
  );
};

function getNavLinkClassNames(
  navbarTheme: string,
  alignRight = false
): (props: { isActive?: boolean }) => string | undefined {
  return ({ isActive = false }) => {
    return getActiveNavLinkClassNames(isActive, navbarTheme, alignRight);
  };
}

const getActiveNavLinkClassNames = (
  isActive: boolean,
  navbarTheme: string,
  alignRight = false
): string | undefined => {
  return classNames('mx-2 py-3 self-end relative', {
    'cursor-default': isActive,
    'text-black dark:text-white': isActive && navbarTheme !== 'yellow',
    'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-300':
      !isActive && navbarTheme !== 'yellow',
    'ml-auto': alignRight,
    'text-black': isActive && navbarTheme === 'yellow',
    'text-black/60 hover:text-black': !isActive && navbarTheme === 'yellow',
  });
};
