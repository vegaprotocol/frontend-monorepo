import type { Provider } from '../../oracle-schema';
import {
  ButtonLink,
  ExternalLink,
  Icon,
  Intent,
  Lozenge,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useOracleStatuses } from '../../hooks';
import type { IconName } from '@blueprintjs/icons';
import { cn } from '@vegaprotocol/utils';
import { getLinkIcon, useVerifiedStatusIcon } from '../oracle-basic-profile';
import { useEnvironment } from '@vegaprotocol/environment';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useT } from '../../use-t';
import { OracleBranding } from './oracle-branding';

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
  return (
    <span className="w-full flex gap-1 items-center justify-between pr-6">
      <span className="flex gap-1 items-center">
        <span
          className={cn(
            {
              'text-gs-50': intent === Intent.None,
              'text-vega-blue': intent === Intent.Primary,
              'text-vega-green dark:text-vega-green': intent === Intent.Success,
              'dark:text-yellow text-yellow-600': intent === Intent.Warning,
              'text-vega-red': intent === Intent.Danger,
            },
            'flex items-start p-1 align-text-bottom'
          )}
        >
          <Icon size={5} name={icon as IconName} />
        </span>
        <span>
          {parentProvider && (
            <Lozenge intent={Intent.Primary}>{t('Updated')}</Lozenge>
          )}
          {provider.url && (
            <span>
              {parentProvider && parentProvider.name && (
                <span className="line-through">{parentProvider.name}</span>
              )}
              <span className="pr-1">{provider.name}</span>
            </span>
          )}
        </span>
      </span>
      <OracleBranding type={provider.type} />
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
}: {
  provider: Provider;
  dataSourceSpecId: string;
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
    <div
      className="flex flex-col gap-4 text-sm"
      data-testid="oracle-full-profile"
    >
      {provider.oracle.status !== 'GOOD' && (
        <OracleStatus oracle={provider.oracle} />
      )}
      <p>{message}</p>
      <div>
        <ReactMarkdown className="[word-break:break-word]" linkTarget="_blank">
          {showMore
            ? provider.description_markdown
            : provider.description_markdown.slice(0, 100) + '...'}
        </ReactMarkdown>
        <ButtonLink onClick={() => setShowMore(!showMore)}>
          {!showMore ? t('Read more') : t('Show less')}
        </ButtonLink>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-1">
          <h4 className="text-gs-300 uppercase" data-testid="verified-accounts">
            {t('proofsOfOwnership', '{{count}} proofs of ownership', {
              count: provider.proofs.length,
            })}
          </h4>
          {provider.proofs.length > 0 ? (
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <ExternalLink key={link.url} href={link.url}>
                  <span className="flex items-center gap-1">
                    <VegaIcon name={getLinkIcon(link.type)} size={14} />
                    <span className="capitalize underline">{link.type}</span>
                    <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={14} />
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
            <p className="text-gs-300">
              {t('This oracle has not proven ownership of any accounts.')}
            </p>
          )}
        </div>
        <div className="col-span-1">
          <h4 className="text-gs-300 uppercase">{t('Details')}</h4>
          <div className="flex flex-col gap-1">
            {dataSourceSpecId && (
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/oracles/${dataSourceSpecId}`}
                data-testid="block-explorer-link"
              >
                {t('Block explorer')}
              </ExternalLink>
            )}
            {provider.github_link && (
              <ExternalLink
                href={provider.github_link}
                data-testid="github-link"
              >
                {t('Oracle repository')}
              </ExternalLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
