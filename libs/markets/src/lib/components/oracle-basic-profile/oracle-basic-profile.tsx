import type { Provider } from '../../oracle-schema';
import {
  ButtonLink,
  ExternalLink,
  Icon,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import { cn } from '@vegaprotocol/ui-toolkit';
import type { OracleMarketSpecFieldsFragment } from '../../__generated__/OracleMarketsSpec';
import { useT } from '../../use-t';

export const useVerifiedStatusIcon = (provider: Provider) => {
  const t = useT();
  const getIconIntent = () => {
    switch (provider.oracle.status) {
      case 'GOOD':
        return { icon: IconNames.TICK_CIRCLE, intent: Intent.Success };
      case 'RETIRED':
        return { icon: IconNames.MOON, intent: Intent.None };
      case 'UNKNOWN':
        return { icon: IconNames.HELP, intent: Intent.Primary };
      case 'MALICIOUS':
        return { icon: IconNames.ERROR, intent: Intent.Danger };
      case 'SUSPICIOUS':
        return { icon: IconNames.ERROR, intent: Intent.Danger };
      case 'COMPROMISED':
        return { icon: IconNames.ERROR, intent: Intent.Danger };
      default:
        return { icon: IconNames.HELP, intent: Intent.Primary };
    }
  };

  if (!provider.oracle.first_verified || !provider.oracle.last_verified) {
    return {
      message: t('Not verified'),
      ...getIconIntent(),
    };
  }

  const lastVerified = provider.oracle.last_verified
    ? new Date(provider.oracle.last_verified)
    : new Date(provider.oracle.first_verified);

  return {
    ...getIconIntent(),
    message: t('Verified since {{lastVerified}}', {
      lastVerified: lastVerified.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      }),
    }),
  };
};

export const OracleBasicProfile = ({
  provider,
  onClick,
  markets: oracleMarkets,
}: {
  provider: Provider;
  markets?: OracleMarketSpecFieldsFragment[] | undefined;
  onClick?: (value?: boolean) => void;
}) => {
  const t = useT();
  const { icon, message, intent } = useVerifiedStatusIcon(provider);

  const verifiedProofs = provider.proofs.filter(
    (proof) => proof.available === true
  );

  const links = provider.proofs
    .filter((proof) => proof.format === 'url' && proof.available === true)
    .map((proof) => ({
      ...proof,
      url: 'url' in proof ? proof.url : '',
      icon: getLinkIcon(proof.type),
    }));

  return (
    <>
      <span className="flex gap-1">
        {provider.url && (
          <span className="flex align-items-bottom text-md gap-1">
            <ButtonLink
              onClick={() => onClick && onClick(true)}
              data-testid="provider-name"
            >
              {provider.name}
            </ButtonLink>
            <span className="text-gs-300" data-testid="verified-proofs">
              ({verifiedProofs.length})
            </span>
          </span>
        )}
        <span
          className={cn(
            {
              'text-gs-700': intent === Intent.None,
              'text-vega-blue': intent === Intent.Primary,
              'text-vega-green dark:text-vega-green': intent === Intent.Success,
              'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
              'text-vega-red': intent === Intent.Danger,
            },
            'flex items-start align-text-bottom p-1'
          )}
        >
          <Icon size={3} name={icon as IconName} />
        </span>
      </span>
      <p className="mb-2 text-sm text-gs-300">{message}</p>
      {oracleMarkets && (
        <p data-testid="signed-proofs" className="mb-2 text-sm text-gs-300">
          {t('involvedInMarkets', 'Involved in {{count}} markets', {
            count: oracleMarkets.length,
          })}
        </p>
      )}
      {links.length > 0 && (
        <div className="flex flex-row gap-3">
          {links.map((link) => (
            <ExternalLink key={link.url} href={link.url} data-testid={link.url}>
              <span className="flex items-center gap-1">
                <VegaIcon name={getLinkIcon(link.type)} />
                <span className="underline capitalize">{link.type}</span>
                <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={13} />
              </span>
            </ExternalLink>
          ))}
        </div>
      )}
    </>
  );
};

export const getLinkIcon = (type: string) => {
  switch (type) {
    case 'twitter':
      return VegaIconNames.TWITTER;
    case 'github':
      return VegaIconNames.GLOBE;
    case 'linkedin':
      return VegaIconNames.LINKEDIN;
    default:
      return VegaIconNames.GLOBE;
  }
};
