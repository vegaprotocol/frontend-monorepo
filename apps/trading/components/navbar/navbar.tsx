import type { ComponentProps } from 'react';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useLinks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  ThemeSwitcher,
  Navigation,
  NavigationList,
  NavigationItem,
  NavigationLink,
  ExternalLink,
  Icon,
  NavigationBreakpoint,
} from '@vegaprotocol/ui-toolkit';

import { Links, Routes } from '../../pages/client-router';

export const Navbar = ({
  theme = 'system',
}: {
  theme: ComponentProps<typeof Navigation>['theme'];
}) => {
  const tokenLink = useLinks(DApp.Token);
  const { marketId } = useGlobalStore((store) => ({
    marketId: store.marketId,
  }));
  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();
  return (
    <Navigation
      appName="Console"
      theme={theme}
      actions={
        <>
          <ThemeSwitcher />
          <VegaWalletConnectButton />
        </>
      }
      breakpoints={[500, 1050]}
    >
      <NavigationList hide={[NavigationBreakpoint.Small]}>
        <NavigationItem>
          <NetworkSwitcher />
        </NavigationItem>
      </NavigationList>
      <NavigationList
        hide={[NavigationBreakpoint.Narrow, NavigationBreakpoint.Small]}
      >
        <NavigationItem>
          <NavigationLink to={Links[Routes.MARKETS]()}>
            {t('Markets')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to={tradingPath}>{t('Trading')}</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink to={Links[Routes.PORTFOLIO]()}>
            {t('Portfolio')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <ExternalLink href={tokenLink(TOKEN_GOVERNANCE)}>
            <span className="flex items-center gap-2">
              <span>{t('Governance')}</span>{' '}
              <Icon name="arrow-top-right" size={3} />
            </span>
          </ExternalLink>
        </NavigationItem>
      </NavigationList>
    </Navigation>
  );
};
