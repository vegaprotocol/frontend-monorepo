import type { Provider } from '../../oracle-schema';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import {
  ButtonLink,
  ExternalLink,
  Icon,
  Intent,
  Lozenge,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useOracleStatuses } from '../oracle-banner/oracle-statuses';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import { getLinkIcon, useVerifiedStatusIcon } from '../oracle-basic-profile';
import { useEnvironment } from '@vegaprotocol/environment';
import type { OracleMarketSpecFieldsFragment } from '../../__generated__/OracleMarketsSpec';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useT } from '../../use-t';

export const OracleProfileTitle = ({
  provider,
  parentProvider,
}: {
  provider: Provider;
  parentProvider?: Provider;
}) => {
  const t = useT();
  // If this is a successor market, the parent provider will only have been passed
  // in if it differs from the current provider. If it is different, we'll just
  // show the change in name, not icons and proofs.
  const { icon, intent } = useVerifiedStatusIcon(provider);
  const verifiedProofs = provider.proofs.filter(
    (proof) => proof.available === true
  );
  return (
    <span className="flex gap-1">
      {parentProvider && (
        <Lozenge variant={Intent.Primary}>{t('Updated')}</Lozenge>
      )}
      {provider.url && (
        <span>
          {parentProvider && parentProvider.name && (
            <span className="line-through">{parentProvider.name}</span>
          )}
          <span className="pr-1">{provider.name}</span>
          <span className="dark:text-vega-light-300 text-vega-dark-300">
            ({verifiedProofs.length})
          </span>
        </span>
      )}
      <span
        className={classNames(
          {
            'text-gray-700 dark:text-gray-300': intent === Intent.None,
            'text-vega-blue': intent === Intent.Primary,
            'text-vega-green dark:text-vega-green': intent === Intent.Success,
            'dark:text-yellow text-yellow-600': intent === Intent.Warning,
            'text-vega-red': intent === Intent.Danger,
          },
          'flex items-start p-1 align-text-bottom'
        )}
      >
        <Icon size={6} name={icon as IconName} />
      </span>
    </span>
  );
};

const OracleStatus = ({ oracle }: { oracle: Provider['oracle'] }) => {
  const oracleStatuses = useOracleStatuses();
  const t = useT();
  return (
    <div>
      {t(`Oracle status: {{status}}. {{description}}`, {
        status: oracle.status,
        description: oracleStatuses[oracle.status],
      })}
      {oracle.status_reason ? (
        <div>
          <ReactMarkdown
            className="react-markdown-container"
            skipHtml={true}
            disallowedElements={['img']}
            linkTarget="_blank"
          >
            {oracle.status_reason}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
};

export const OracleFullProfile = ({
  provider,
  dataSourceSpecId,
  markets: oracleMarkets,
}: {
  provider: Provider;
  dataSourceSpecId: string;
  markets?: OracleMarketSpecFieldsFragment[] | undefined;
}) => {
  const t = useT();
  const { message } = useVerifiedStatusIcon(provider);
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const [showMore, setShowMore] = useState(false);

  const links = provider.proofs
    .filter((proof) => proof.format === 'url' && proof.available === true)
    .map((proof) => ({
      ...proof,
      url: 'url' in proof ? proof.url : '',
      icon: getLinkIcon(proof.type),
    }));
  const signedMessageProofs = provider.proofs.filter(
    (proof) => proof.format === 'signed_message' && proof.available === true
  );

  return (
    <div className="flex flex-col text-sm" data-testid="oracle-full-profile">
      <div className="dark:text-vega-light-300 text-vega-dark-300">
        {provider.oracle.status !== 'GOOD' ? (
          <div className="mb-2">
            <OracleStatus oracle={provider.oracle} />
          </div>
        ) : null}
        <div className="mb-2">{message}</div>
        <div className="mb-2">
          <ReactMarkdown
            className="[word-break:break-word]"
            linkTarget="_blank"
          >
            {showMore
              ? provider.description_markdown
              : provider.description_markdown.slice(0, 100) + '...'}
          </ReactMarkdown>
          <span>
            <ButtonLink onClick={() => setShowMore(!showMore)}>
              {!showMore ? t('Read more') : t('Show less')}
            </ButtonLink>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-1">
          <p
            className="dark:text-vega-light-300 text-vega-dark-300 uppercase"
            data-testid="verified-accounts"
          >
            {t('proofsOfOwnership', '{{count}} proofs of ownership', {
              count: provider.proofs.length,
            })}
          </p>
          {provider.proofs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <ExternalLink
                  key={link.url}
                  href={link.url}
                  className="align-items-bottom flex text-sm underline"
                >
                  <span className="pr-1 pt-1">
                    <VegaIcon name={getLinkIcon(link.type)} />
                  </span>
                  <span className="capitalize underline">
                    {link.type}{' '}
                    <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
                  </span>
                </ExternalLink>
              ))}
              {signedMessageProofs.length > 0 && (
                <ExternalLink
                  key={'more-proofs'}
                  href={provider.github_link}
                  className="align-items-bottom flex pt-2 text-sm underline"
                >
                  {links.length > 0 ? (
                    <span className="underline">
                      {t('moreProofs', 'And {{count}} more proofs', {
                        count: signedMessageProofs.length,
                      })}{' '}
                      <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
                    </span>
                  ) : (
                    <span className="underline">
                      {t(
                        'verifyProofs',
                        'Verify {{count}} proofs of ownership',
                        {
                          count: signedMessageProofs.length,
                        }
                      )}{' '}
                      <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
                    </span>
                  )}
                </ExternalLink>
              )}
            </div>
          ) : (
            <p className="dark:text-vega-light-300 text-vega-dark-300">
              {t('This oracle has not proven ownership of any accounts.')}
            </p>
          )}
        </div>
        <div className="col-span-1 flex flex-col gap-2 py-2">
          <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase">
            {t('Details')}
          </p>
          {dataSourceSpecId && (
            <ExternalLink
              href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
              data-testid="block-explorer-link"
            >
              {t('Block explorer')}
            </ExternalLink>
          )}
          {provider.github_link && (
            <ExternalLink href={provider.github_link} data-testid="github-link">
              {t('Oracle repository')}
            </ExternalLink>
          )}
        </div>
      </div>
      <div>
        {oracleMarkets && (
          <p className="dark:text-vega-light-300 text-vega-dark-300 mt-4 uppercase">
            {t('oracleInMarkets', 'Oracle in {{count}} markets', {
              count: oracleMarkets.length,
            })}
          </p>
        )}
      </div>
      {oracleMarkets && oracleMarkets.length > 0 && (
        <div
          data-testid="oracle-markets"
          className="border-vega-light-200 dark:border-vega-dark-200 my-2 rounded-lg border-2 border-solid px-2 py-4"
        >
          <div className="font-alpha calt dark:text-vega-light-300 text-vega-dark-300 mb-2 grid grid-cols-4 gap-1 uppercase">
            <div className="col-span-1">{t('Market')}</div>
            <div className="col-span-1">{t('Status')}</div>
            <div className="col-span-1">{t('Specifications')}</div>
          </div>
          <div className="max-h-60 overflow-auto">
            {oracleMarkets?.map((market) => (
              <div
                className="mb-2 grid grid-cols-4 gap-1 capitalize last:mb-0"
                key={`oracle-market-${market.id}`}
              >
                <div className="col-span-1">
                  {market.tradableInstrument.instrument.code}
                </div>
                <div
                  className={classNames('col-span-1', {
                    'dark:text-vega-light-300 text-vega-dark-300': ![
                      MarketState.STATE_ACTIVE,
                      MarketState.STATE_PROPOSED,
                    ].includes(market.state),
                  })}
                >
                  {MarketStateMapping[market.state]}
                </div>
                {(market.tradableInstrument.instrument.product.__typename ===
                  'Future' ||
                  market.tradableInstrument.instrument.product.__typename ===
                    'Perpetual') &&
                  market.tradableInstrument.instrument.product && (
                    <div className="col-span-1">
                      {
                        <ExternalLink
                          href={`${VEGA_EXPLORER_URL}/oracles/${market.tradableInstrument?.instrument.product?.dataSourceSpecForSettlementData.id}`}
                          data-testid="block-explorer-link-settlement"
                        >
                          {t('Settlement')}
                        </ExternalLink>
                      }
                    </div>
                  )}
                {'dataSourceSpecForTradingTermination' in
                  market.tradableInstrument.instrument.product && (
                  <div className="col-span-1">
                    {
                      <ExternalLink
                        href={`${VEGA_EXPLORER_URL}/oracles/${market.tradableInstrument?.instrument.product?.dataSourceSpecForTradingTermination.id}`}
                        data-testid="block-explorer-link-termination"
                      >
                        {t('Termination')}
                      </ExternalLink>
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
