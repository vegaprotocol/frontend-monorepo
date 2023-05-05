import { t } from '@vegaprotocol/i18n';
import type { Provider } from '../../oracle-schema';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import {
  ButtonLink,
  ExternalLink,
  Icon,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import classNames from 'classnames';
import { getLinkIcon, getVerifiedStatusIcon } from '../oracle-basic-profile';
import { useEnvironment } from '@vegaprotocol/environment';
import type { OracleMarketSpecFieldsFragment } from '../../__generated__/OracleMarketsSpec';
import { useState } from 'react';

export const OracleProfileTitle = ({ provider }: { provider: Provider }) => {
  const { icon, intent } = getVerifiedStatusIcon(provider);
  const verifiedProofs = provider.proofs.filter(
    (proof) => proof.available === true
  );
  return (
    <span className="flex gap-1">
      {provider.url && (
        <span>
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
            'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
            'text-vega-pink': intent === Intent.Danger,
          },
          'flex items-start align-text-bottom p-1'
        )}
      >
        <Icon size={6} name={icon as IconName} />
      </span>
    </span>
  );
};

export const OracleFullProfile = ({
  provider,
  id,
  markets: oracleMarkets,
}: {
  provider: Provider;
  id: string;
  markets?: OracleMarketSpecFieldsFragment[] | undefined;
}) => {
  const { message } = getVerifiedStatusIcon(provider);
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const [showMore, setShowMore] = useState(false);

  const links = provider.proofs
    .filter((proof) => proof.format === 'url' && proof.available === true)
    .map((proof) => ({
      ...proof,
      url: 'url' in proof ? proof.url : '',
      icon: getLinkIcon(proof.type),
    }));

  return (
    <div className="flex flex-col text-sm">
      <div className="dark:text-vega-light-300 text-vega-dark-300">
        <p className=" pb-2">{message}</p>
        {!showMore && (
          <p className="pb-2">
            {provider.description_markdown.slice(0, 100)}
            {'... '}
            <span className="ml-2">
              <ButtonLink onClick={() => setShowMore(!showMore)}>
                Read more
              </ButtonLink>
            </span>
          </p>
        )}
        {showMore && (
          <p className="pb-2">
            {provider.description_markdown}
            <span className="ml-2">
              <ButtonLink onClick={() => setShowMore(!showMore)}>
                Show less
              </ButtonLink>
            </span>
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-1">
          <p
            className="dark:text-vega-light-300 text-vega-dark-300 uppercase"
            data-testid="verified-accounts"
          >
            {t('%s proofs of ownership', links.length.toString())}
          </p>
          {links.length > 0 ? (
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <ExternalLink
                  key={link.url}
                  href={link.url}
                  className="flex align-items-bottom underline text-sm"
                >
                  <span className="pt-1">
                    <VegaIcon name={getLinkIcon(link.type)} />
                  </span>
                  <span className="underline capitalize">
                    {link.type}{' '}
                    <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
                  </span>
                </ExternalLink>
              ))}
            </div>
          ) : (
            <p className="dark:text-vega-light-300 text-vega-dark-300">
              {t('This oracle has not proven ownership of any accounts.')}
            </p>
          )}
        </div>
        <div className="col-span-1 gap-2 py-2 flex flex-col">
          <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase">
            {t('Details')}
          </p>
          {id && (
            <ExternalLink
              href={`${VEGA_EXPLORER_URL}/oracles/${id}`}
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
          <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase mt-4">
            {t('Oracle in %s %s', [
              oracleMarkets.length.toString(),
              oracleMarkets.length === 1 ? 'market' : 'markets',
            ])}
          </p>
        )}
      </div>
      {oracleMarkets && oracleMarkets.length > 0 && (
        <div
          data-testid="oracle-markets"
          className="border-vega-light-200 dark:border-vega-dark-200 border-solid border-2 py-4 px-2 rounded-lg my-2"
        >
          <div className="grid grid-cols-4 gap-1 uppercase mb-2 font-alpha calt dark:text-vega-light-300 text-vega-dark-300">
            <div className="col-span-1">{t('Market')}</div>
            <div className="col-span-1">{t('Status')}</div>
            <div className="col-span-1">{t('Specifications')}</div>
          </div>
          <div className="max-h-60 overflow-auto">
            {oracleMarkets?.map((market) => (
              <div
                className="grid grid-cols-4 gap-1 capitalize mb-2 last:mb-0"
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
