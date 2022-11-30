import classNames from 'classnames';
import { NavLink, Link } from 'react-router-dom';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import type { HTMLAttributeAnchorTarget } from 'react';
import { useEffect, useState } from 'react';
import Routes from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import vegaWhite from '../../images/vega_white.png';
import debounce from 'lodash/debounce';
import { NavDrawer } from './nav-draw';

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

export const Nav = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isDesktop = windowWidth > 995;

  useEffect(() => {
    const handleResizeDebounced = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, []);

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

  const routes = [
    {
      name: t('Proposals'),
      path: Routes.PROPOSALS,
    },
    {
      name: t('Validators'),
      path: Routes.VALIDATORS,
    },
    {
      name: t('Rewards'),
      path: Routes.REWARDS,
    },
    {
      name: t('Token'),
      path: Routes.TOKEN,
    },
    {
      name: t('Redeem'),
      path: Routes.REDEEM,
    },
    {
      name: t('Withdraw'),
      path: Routes.WITHDRAWALS,
    },
    {
      name: t('Supply & Vesting'),
      path: Routes.TRANCHES,
    },
  ];

  return (
    <div className={themeWrapperClasses}>
      <div className={navbarClasses}>
        <div className="flex gap-4 items-center">
          <Link to="/">
            <img alt="Vega" src={vegaWhite} height={30} width={30} />
          </Link>
          <h1
            className={classNames(
              'h-full flex flex-col my-0 justify-center font-alpha calt',
              { 'text-black': isYellow, 'text-white': !isYellow }
            )}
          >
            {t('Governance')}
          </h1>
          <NetworkSwitcher />
        </div>
        {isDesktop ? (
          <nav className="flex items-center flex-1 px-2">
            {routes.map((r) => (
              <AppNavLink {...r} navbarTheme={navbarTheme} />
            ))}
          </nav>
        ) : (
          <nav className="flex items-center flex-1 px-2 justify-end">
            <NavDrawer inverted={isYellow} routes={routes} />
          </nav>
        )}
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
      end={true}
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
