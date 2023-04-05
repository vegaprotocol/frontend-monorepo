import type { ComponentProps, ReactNode } from 'react';
import {
  DApp,
  NetworkSwitcher,
  TOKEN_GOVERNANCE,
  useEnvironment,
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
  NavigationTrigger,
  NavigationContent,
} from '@vegaprotocol/ui-toolkit';

import { Links, Routes } from '../../pages/client-router';
import { createDocsLinks } from '@vegaprotocol/utils';

export const Navbar = ({
  theme = 'system',
}: {
  theme: ComponentProps<typeof Navigation>['theme'];
}) => {
  const { VEGA_DOCS_URL, GITHUB_FEEDBACK_URL } = useEnvironment();
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
      breakpoints={[521, 1067]}
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
          <NavigationLink data-testid="Trading" to={tradingPath}>
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
        {VEGA_DOCS_URL && GITHUB_FEEDBACK_URL && (
          <NavigationItem>
            <NavigationTrigger>{t('Resources')}</NavigationTrigger>
            <NavigationContent>
              <NavigationList>
                <NavigationItem>
                  <NavExternalLink
                    href={createDocsLinks(VEGA_DOCS_URL).NEW_TO_VEGA}
                  >
                    {t('Docs')}
                  </NavExternalLink>
                </NavigationItem>
                <NavigationItem>
                  <NavExternalLink href={GITHUB_FEEDBACK_URL}>
                    {t('Give Feedback')}
                  </NavExternalLink>
                </NavigationItem>
              </NavigationList>
            </NavigationContent>
          </NavigationItem>
        )}
      </NavigationList>
      <NavigationList
        className="[.drawer-content_&]:border-t [.drawer-content_&]:border-t-vega-light-200 dark:[.drawer-content_&]:border-t-vega-dark-200 [.drawer-content_&]:pt-8 [.drawer-content_&]:mt-4"
        hide={[
          NavigationBreakpoint.Small,
          NavigationBreakpoint.Narrow,
          NavigationBreakpoint.Full,
        ]}
      >
        <NavigationItem className="[.drawer-content_&]:w-full text-black dark:text-white">
          <ThemeSwitcher withMobile />
        </NavigationItem>
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
        <Icon name="arrow-top-right" size={3} />
      </span>
    </ExternalLink>
  );
};
