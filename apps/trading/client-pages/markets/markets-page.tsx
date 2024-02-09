import {
  LocalStoragePersistTabs as Tabs,
  Tab,
  TradingAnchorButton,
} from '@vegaprotocol/ui-toolkit';
import { OpenMarkets } from './open-markets';
import { Proposed } from './proposed';
import { Closed } from './closed';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { MarketsSettings } from './markets-settings';
import { usePageTitle } from '../../lib/hooks/use-page-title';

export const MarketsPage = () => {
  const t = useT();
  const governanceLink = useLinks(DApp.Governance);
  const externalLink = governanceLink(TOKEN_NEW_MARKET_PROPOSAL);

  usePageTitle(t('Markets'));

  return (
    <div className="h-full pt-0.5 pb-3 px-1.5">
      <div className="h-full my-1 border rounded-sm border-default">
        <Tabs storageKey="console-markets">
          <Tab
            id="open-markets"
            name={t('Open markets')}
            settings={<MarketsSettings />}
          >
            <ErrorBoundary feature="markets-open">
              <OpenMarkets />
            </ErrorBoundary>
          </Tab>
          <Tab
            id="proposed-markets"
            name={t('Proposed markets')}
            settings={<MarketsSettings />}
            menu={
              <TradingAnchorButton
                size="extra-small"
                data-testid="propose-new-market"
                href={externalLink}
                target="_blank"
              >
                {t('Propose a new market')}
              </TradingAnchorButton>
            }
          >
            <ErrorBoundary feature="markets-proposed">
              <Proposed />
            </ErrorBoundary>
          </Tab>
          <Tab
            id="closed-markets"
            name={t('Closed markets')}
            settings={<MarketsSettings />}
          >
            <ErrorBoundary feature="markets-closed">
              <Closed />
            </ErrorBoundary>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};
