import { matchPath, useLocation } from 'react-router-dom';
import {
  ThemeSwitcher,
  Navigation,
  NavigationList,
  NavigationItem,
  NavigationLink,
  NavigationBreakpoint,
  NavigationTrigger,
  NavigationContent,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { Routes } from '../../routes/route-names';
import { NetworkSwitcher } from '@vegaprotocol/environment';
import type { Navigable } from '../../routes/router-config';
import routerConfig from '../../routes/router-config';
import { useMemo } from 'react';
import compact from 'lodash/compact';
import { Search } from '../search';

const routeToNavigationItem = (r: Navigable) => (
  <NavigationItem key={r.name}>
    <NavigationLink to={r.path}>{r.text}</NavigationLink>
  </NavigationItem>
);

export const Header = () => {
  const mainItems = compact(
    [Routes.TX, Routes.BLOCKS, Routes.ORACLES, Routes.VALIDATORS].map((n) =>
      routerConfig.find((r) => r.path === n)
    )
  );

  const groupedItems = compact(
    [
      Routes.PARTIES,
      Routes.ASSETS,
      Routes.MARKETS,
      Routes.GOVERNANCE,
      Routes.NETWORK_PARAMETERS,
      Routes.GENESIS,
    ].map((n) => routerConfig.find((r) => r.path === n))
  );

  const { pathname } = useLocation();
  const isOnOther = useMemo(() => {
    for (const path of groupedItems.map((r) => r.path)) {
      const matched = matchPath(`${path}/*`, pathname);
      if (matched) return true;
    }
    return false;
  }, [groupedItems, pathname]);

  return (
    <Navigation
      appName="Explorer"
      theme="system"
      breakpoints={[400, 800]}
      actions={
        <>
          <ThemeSwitcher />
          <Search />
        </>
      }
    >
      <NavigationList hide={[NavigationBreakpoint.Small]}>
        <NavigationItem>
          <NetworkSwitcher />
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Small, NavigationBreakpoint.Narrow]}
      >
        {mainItems.map(routeToNavigationItem)}
        {groupedItems && (
          <NavigationItem>
            <NavigationTrigger isActive={Boolean(isOnOther)}>
              {t('Other')}
            </NavigationTrigger>
            <NavigationContent>
              <NavigationList>
                {groupedItems.map(routeToNavigationItem)}
              </NavigationList>
            </NavigationContent>
          </NavigationItem>
        )}
      </NavigationList>
    </Navigation>
  );
};
