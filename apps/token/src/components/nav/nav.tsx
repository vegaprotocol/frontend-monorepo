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
import {
  getNavLinkClassNames,
  Nav as ToolkitNav,
} from '@vegaprotocol/ui-toolkit';

const useDebouncedResize = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResizeDebounced = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 300);

    window.addEventListener('resize', handleResizeDebounced);

    return () => {
      window.removeEventListener('resize', handleResizeDebounced);
    };
  }, []);
  return {
    windowWidth,
  };
};

type NavbarTheme = 'inherit' | 'dark' | 'yellow';
interface NavbarProps {
  navbarTheme?: NavbarTheme;
}

export const Nav = ({ navbarTheme = 'inherit' }: NavbarProps) => {
  const { windowWidth } = useDebouncedResize();
  const isDesktop = windowWidth > 995;

  const { t } = useTranslation();
  const isYellow = navbarTheme === 'yellow';
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
    <ToolkitNav
      navbarTheme={navbarTheme}
      icon={
        <Link to="/">
          <img alt="Vega" src={vegaWhite} height={30} width={30} />
        </Link>
      }
      title={t('Governance')}
      titleContent={<NetworkSwitcher />}
    >
      {isDesktop ? (
        <nav className="flex items-center flex-1 px-2">
          {routes.map((r, i) => (
            <AppNavLink {...r} navbarTheme={navbarTheme} key={i} />
          ))}
        </nav>
      ) : (
        <nav className="flex items-center flex-1 px-2 justify-end">
          <NavDrawer inverted={isYellow} routes={routes} />
        </nav>
      )}
    </ToolkitNav>
  );
};

interface AppNavLinkProps {
  name: string;
  path: string;
  navbarTheme: NavbarTheme;
  testId?: string;
  target?: HTMLAttributeAnchorTarget;
}

const AppNavLink = ({
  name,
  path,
  navbarTheme,
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
      className={getNavLinkClassNames(navbarTheme)}
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
