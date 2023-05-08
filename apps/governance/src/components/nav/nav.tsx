import { NetworkSwitcher } from '@vegaprotocol/environment';
import { TOKEN_DROPDOWN_ROUTES, TOP_LEVEL_ROUTES } from '../../routes/routes';
import { useTranslation } from 'react-i18next';
import type { NavigationProps } from '@vegaprotocol/ui-toolkit';
import { useNavigationDrawer } from '@vegaprotocol/ui-toolkit';
import {
  Navigation,
  NavigationBreakpoint,
  NavigationContent,
  NavigationItem,
  NavigationLink,
  NavigationList,
  NavigationTrigger,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { EthWallet } from '../eth-wallet';
import { VegaWallet } from '../vega-wallet';
import { useLocation, useMatch } from 'react-router-dom';
import { useEffect } from 'react';
import { useTelemetryDialog } from '../telemetry-dialog/telemetry-dialog';

export const SettingsLink = () => {
  const { open, isOpen, close } = useTelemetryDialog();
  return (
    <button
      type="button"
      onClick={() => (isOpen ? close() : open())}
      aria-label="Open Telemetry Settings"
    >
      <Icon name="cog" className="w-5 h-5 mr-2" />
    </button>
  );
};

export const Nav = ({ theme }: Pick<NavigationProps, 'theme'>) => {
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
      theme={theme}
      breakpoints={[458, 959]}
      actions={<SettingsLink />}
    >
      <NavigationList
        className="[.drawer-content_&]:border-b [.drawer-content_&]:border-b-vega-light-200 dark:[.drawer-content_&]:border-b-vega-dark-200 [.drawer-content_&]:pb-8 [.drawer-content_&]:mb-2"
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
        className="[.drawer-content_&]:border-t [.drawer-content_&]:border-t-vega-light-200 dark:[.drawer-content_&]:border-t-vega-dark-200 [.drawer-content_&]:pt-8 [.drawer-content_&]:mt-4"
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
