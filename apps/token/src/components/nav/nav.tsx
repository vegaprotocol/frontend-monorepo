import { Link } from 'react-router-dom';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import { useEffect, useState } from 'react';
import Routes, { TOP_LEVEL_ROUTES } from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import vegaWhite from '../../images/vega_white.png';
import debounce from 'lodash/debounce';
import { NavDrawer } from './nav-draw';
import { Nav as ToolkitNav } from '@vegaprotocol/ui-toolkit';
import { AppNavLink } from './nav-link';
import { NavDropDown } from './nav-dropdown';

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

  return (
    <ToolkitNav
      navbarTheme={navbarTheme}
      icon={
        <Link to="/" data-testid="logo-link">
          <img alt="Vega" src={vegaWhite} height={30} width={30} />
        </Link>
      }
      title={t('Governance')}
      titleContent={<NetworkSwitcher />}
    >
      {isDesktop ? (
        <nav className="flex items-center flex-1 px-2">
          {TOP_LEVEL_ROUTES.map((r) => (
            <AppNavLink
              key={r.path}
              testId={r.name}
              name={t(r.name)}
              path={r.path}
              navbarTheme={navbarTheme}
            />
          ))}
          <NavDropDown navbarTheme={navbarTheme} />
        </nav>
      ) : (
        <nav className="flex items-center flex-1 px-2 justify-end">
          <NavDrawer inverted={isYellow} routes={TOP_LEVEL_ROUTES} />
        </nav>
      )}
    </ToolkitNav>
  );
};
