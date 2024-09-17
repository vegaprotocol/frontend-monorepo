import { NetworkSwitcher } from '@vegaprotocol/environment';
import { TOKEN_DROPDOWN_ROUTES, TOP_LEVEL_ROUTES } from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import { useNavigationDrawer } from '@vegaprotocol/ui-toolkit';
import {
  Navigation,
  NavigationBreakpoint,
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationTrigger,
} from '@vegaprotocol/ui-toolkit';
import { EthWallet } from '../eth-wallet';
import { VegaWallet } from '../vega-wallet';
import { useLocation, useMatch } from 'react-router-dom';
import { useEffect } from 'react';
import { ProtocolUpgradeCountdown } from '@vegaprotocol/proposals';

export const Nav = () => {
  const { t } = useTranslation();
  const setDrawerOpen = useNavigationDrawer((state) => state.setDrawerOpen);

  const location = useLocation();
  const isOnToken = useMatch('token/*');
  useEffect(() => {
    setDrawerOpen(false);
  }, [location, setDrawerOpen]);

  const topLevel = TOP_LEVEL_ROUTES.map(({ name, path }) => (
    <NavigationItem key={name}>
      <NavigationLink to={path}>{name}</NavigationLink>
    </NavigationItem>
  ));

  const secondLevel = TOKEN_DROPDOWN_ROUTES.map(({ name, path, end }) => (
    <NavigationItem key={name}>
      <NavigationLink to={path} end={Boolean(end)}>
        {name}
      </NavigationLink>
    </NavigationItem>
  ));

  return (
    <Navigation
      appName="Governance"
      breakpoints={[458, 959]}
      actions={<ProtocolUpgradeCountdown />}
    >
      <NavigationList
        className="[.drawer-content_&]:border-b [.drawer-content_&]:pb-8 [.drawer-content_&]:mb-2"
        hide={[NavigationBreakpoint.Small]}
      >
        <NavigationItem className="[.drawer-content_&]:w-full">
          <NetworkSwitcher className="[.drawer-content_&]:w-full" />
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        {topLevel}
        <NavigationItem>
          <NavigationTrigger
            data-testid="state-trigger"
            isActive={Boolean(isOnToken)}
          >
            {t('Token')}
          </NavigationTrigger>
          <NavigationContent>
            <NavigationList data-testid="token-dropdown">
              {secondLevel}
            </NavigationList>
          </NavigationContent>
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={true}
        className="[.drawer-content_&]:border-t [.drawer-content_&]:pt-8 [.drawer-content_&]:mt-4"
      >
        <NavigationItem className="[.drawer-content_&]:w-full">
          <EthWallet />
        </NavigationItem>
        <NavigationItem className="[.drawer-content_&]:w-full">
          <VegaWallet />
        </NavigationItem>
      </NavigationList>
    </Navigation>
  );
};
