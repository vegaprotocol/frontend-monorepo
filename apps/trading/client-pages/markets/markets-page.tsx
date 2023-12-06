import React, { useEffect } from 'react';
import { titlefy } from '@vegaprotocol/utils';
import {
  LocalStoragePersistTabs as Tabs,
  Tab,
  TradingAnchorButton,
} from '@vegaprotocol/ui-toolkit';
import { OpenMarkets } from './open-markets';
import { Proposed } from './proposed';
import { usePageTitleStore } from '../../stores';
import { Closed } from './closed';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';

export const MarketsPage = () => {
  const t = useT();
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  const governanceLink = useLinks(DApp.Governance);
  const externalLink = governanceLink(TOKEN_NEW_MARKET_PROPOSAL);

  useEffect(() => {
    updateTitle(titlefy([t('Markets')]));
  }, [updateTitle, t]);

  return (
    <div className="h-full pt-0.5 pb-3 px-1.5">
      <div className="h-full my-1 border rounded-sm border-default">
        <Tabs storageKey="console-markets">
          <Tab id="open-markets" name={t('Open markets')}>
            <ErrorBoundary feature="markets-open">
              <OpenMarkets />
            </ErrorBoundary>
          </Tab>
          <Tab
            id="proposed-markets"
            name={t('Proposed markets')}
            menu={
              <TradingAnchorButton
                size="extra-small"
                data-testid="propose-new-market"
                href={externalLink}
              >
                {t('Propose a new market')}
              </TradingAnchorButton>
            }
          >
            <ErrorBoundary feature="markets-proposed">
              <Proposed />
            </ErrorBoundary>
          </Tab>
          <Tab id="closed-markets" name={t('Closed markets')}>
            <ErrorBoundary feature="markets-closed">
              <Closed />
            </ErrorBoundary>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};
