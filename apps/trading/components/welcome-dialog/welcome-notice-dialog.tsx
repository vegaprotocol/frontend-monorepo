import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import {
  DApp,
  Networks,
  TOKEN_NEW_MARKET_PROPOSAL,
  TOKEN_PROPOSALS,
  useEnvironment,
  useLinks,
} from '@vegaprotocol/environment';
import { ExternalLinks } from '@vegaprotocol/utils';
import { ProposedMarkets } from './proposed-markets';

export const WelcomeNoticeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const consoleFairgroundLink = useLinks(DApp.Console, Networks.TESTNET);
  const isMainnet = VEGA_ENV === Networks.MAINNET;
  return (
    <>
      <h1
        data-testid="welcome-notice-title"
        className="mb-6 p-4 text-center text-2xl"
      >
        {t('Welcome to Console')}
      </h1>
      <p className="leading-6 mb-7">
        {t(
          'There are no markets to trade on right now. Trading on Vega is now live, but markets need to pass a governance vote before they can be traded on. In the meantime:'
        )}
      </p>
      <ul className="list-[square] pl-7">
        {isMainnet && (
          <li>
            <ExternalLink target="_blank" href={consoleFairgroundLink()}>
              {t('Try out Console')}
            </ExternalLink>
            {t(' on Fairground, our Testnet')}
          </li>
        )}
        <li>
          <ExternalLink target="_blank" href={tokenLink(TOKEN_PROPOSALS)}>
            {t('View and vote for proposed markets')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            target="_blank"
            href={tokenLink(TOKEN_NEW_MARKET_PROPOSAL)}
          >
            {t('Propose a market')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink target="_blank" href={ExternalLinks.BLOG}>
            {t('Read about the mainnet launch')}
          </ExternalLink>
        </li>
      </ul>
      <ProposedMarkets />
    </>
  );
};
