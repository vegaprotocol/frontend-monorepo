import type { ComponentProps, ReactNode } from 'react';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useEnvironment,
  useLinks,
  DocsLinks,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useGlobalStore } from '../../stores';
import { VegaWalletConnectButton } from '../vega-wallet-connect-button';
import {
  Navigation,
  NavigationList,
  NavigationItem,
  NavigationLink,
  ExternalLink,
  NavigationBreakpoint,
  NavigationTrigger,
  NavigationContent,
  VegaIconNames,
  VegaIcon,
} from '@vegaprotocol/ui-toolkit';

import { Links, Routes } from '../../pages/client-router';
import {
  ProtocolUpgradeCountdown,
  ProtocolUpgradeCountdownMode,
} from '@vegaprotocol/proposals';

export const Navbar = ({
  theme = 'system',
}: {
  theme: ComponentProps<typeof Navigation>['theme'];
}) => {
  const { GITHUB_FEEDBACK_URL } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const marketId = useGlobalStore((store) => store.marketId);

  const tradingPath = marketId
    ? Links[Routes.MARKET](marketId)
    : Links[Routes.MARKET]();

  return (
    <Navigation
      appName="console"
      theme={theme}
      actions={
        <>
          <ProtocolUpgradeCountdown
            mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
          />
          <VegaWalletConnectButton />
        </>
      }
      breakpoints={[521, 1122]}
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
        <NavigationItem>
          <NavigationLink data-testid="Markets" to={Links[Routes.MARKETS]()}>
            {t('Markets')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink data-testid="Trading" to={tradingPath} end>
            {t('Trading')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink
            data-testid="Portfolio"
            to={Links[Routes.PORTFOLIO]()}
          >
            {t('Portfolio')}
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavExternalLink href={tokenLink(TOKEN_GOVERNANCE)}>
            {t('Governance')}
          </NavExternalLink>
        </NavigationItem>
        {DocsLinks?.NEW_TO_VEGA && GITHUB_FEEDBACK_URL && (
          <NavigationItem>
            <NavigationTrigger>{t('Resources')}</NavigationTrigger>
            <NavigationContent>
              <NavigationList>
                <NavigationItem>
                  <NavExternalLink href={DocsLinks.NEW_TO_VEGA}>
                    {t('Docs')}
                  </NavExternalLink>
                </NavigationItem>
                <NavigationItem>
                  <NavExternalLink href={GITHUB_FEEDBACK_URL}>
                    {t('Give Feedback')}
                  </NavExternalLink>
                </NavigationItem>
                <NavigationItem>
                  <NavigationLink
                    data-testid="Disclaimer"
                    to={Links[Routes.DISCLAIMER]()}
                  >
                    {t('Disclaimer')}
                  </NavigationLink>
                </NavigationItem>
              </NavigationList>
            </NavigationContent>
          </NavigationItem>
        )}
      </NavigationList>
    </Navigation>
  );
};

const NavExternalLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => {
  return (
    <ExternalLink href={href}>
      <span className="flex items-center gap-2">
        <span>{children}</span>
        <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
      </span>
    </ExternalLink>
  );
};
