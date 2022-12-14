import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import {
  BLOG,
  DApp,
  Networks,
  TOKEN_NEW_MARKET_PROPOSAL,
  TOKEN_PROPOSALS,
  useEnvironment,
  useLinks,
} from '@vegaprotocol/environment';
import { ProposedMarkets } from './proposed-markets';

export const WelcomeNoticeDialog = () => {
  const { VEGA_ENV } = useEnvironment();
  const tokenLink = useLinks(DApp.Token);
  const consoleFairgroundLink = useLinks(DApp.Console, Networks.TESTNET);
  const isMainnet = VEGA_ENV === Networks.MAINNET;
  const networkName = isMainnet ? 'mainnet' : 'testnet';

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
          'Vega %s is now live, but markets need to be voted for before the can be traded on. In the meantime:',
          [networkName]
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
            {t('Propose your own markets')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink target="_blank" href={BLOG}>
            {t('Read about the mainnet launch')}
          </ExternalLink>
        </li>
      </ul>
      <ProposedMarkets />
    </>
  );
};
