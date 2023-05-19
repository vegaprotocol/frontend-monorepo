import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import {
  DApp,
  Networks,
  TOKEN_NEW_MARKET_PROPOSAL,
  TOKEN_PROPOSALS,
  useEnvironment,
  useLinks,
  ExternalLinks,
} from '@vegaprotocol/environment';
import { ProposedMarkets } from './proposed-markets';
import { TelemetryApproval } from './telemetry-approval';

export const WelcomeNoticeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const consoleFairgroundLink = useLinks(DApp.Console, Networks.TESTNET);
  const isMainnet = VEGA_ENV === Networks.MAINNET;
  return (
    <>
      <h1
        data-testid="welcome-notice-title"
        className="text-2xl uppercase mb-6 text-center font-alpha calt"
      >
        {t('Welcome to Console')}
      </h1>
      <p className="leading-6 mb-4">
        {t(
          'There are no markets to trade on right now. Trading on Vega is now live, but markets need to pass a governance vote before they can be traded on. In the meantime:'
        )}
      </p>
      <ul className="list-[square] pl-4 mb-4">
        {isMainnet && (
          <li className="mb-1">
            <ExternalLink target="_blank" href={consoleFairgroundLink()}>
              {t('Try out Console')}
            </ExternalLink>
            {t(' on Fairground, our Testnet')}
          </li>
        )}
        <li className="mb-1">
          <ExternalLink target="_blank" href={tokenLink(TOKEN_PROPOSALS)}>
            {t('View and vote for proposed markets')}
          </ExternalLink>
        </li>
        <li className="mb-1">
          <ExternalLink
            target="_blank"
            href={tokenLink(TOKEN_NEW_MARKET_PROPOSAL)}
          >
            {t('Propose a market')}
          </ExternalLink>
        </li>
        <li className="mb-1">
          <ExternalLink target="_blank" href={ExternalLinks.BLOG}>
            {t('Read about the mainnet launch')}
          </ExternalLink>
        </li>
      </ul>
      {isMainnet && (
        <TelemetryApproval
          helpText={t(
            'Help identify bugs and improve the service by sharing anonymous usage data. You can change this in your settings at any time.'
          )}
        />
      )}
      <ProposedMarkets />
    </>
  );
};
