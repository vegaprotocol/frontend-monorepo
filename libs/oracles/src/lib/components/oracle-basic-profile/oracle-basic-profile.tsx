import { t } from '@vegaprotocol/i18n';
import type { Provider } from '../../oracle-schema';
import {
  ExternalLink,
  Icon,
  Intent,
  Link,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';

const getVerifiedStatusIcon = (provider: Provider) => {
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
    message: t(
      'Verified since %s',
      lastVerified.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    ),
  };
};

export const OracleBasicProfile = ({ provider }: { provider: Provider }) => {
  const { icon, message, intent } = getVerifiedStatusIcon(provider);

  const verifiedProofs = provider.proofs.filter(
    (proof) => proof.available === true
  );

  const signedProofs = provider.proofs.filter(
    (proof) => proof.format === 'signed_message' && proof.available === true
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
          <Link
            href={provider.github_link}
            className="flex align-items-bottom text-md"
            target="_blank"
          >
            <span>
              <span data-testid="provider-name" className="underline pr-1">
                {provider.name}
              </span>
              <span
                data-testid="verified-proofs"
                className="dark:text-vega-light-300 text-vega-dark-300"
              >
                ({verifiedProofs.length})
              </span>
            </span>
          </Link>
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
          <Icon size={3} name={icon as IconName} />
        </span>
      </span>
      <p className="dark:text-vega-light-300 text-vega-dark-300">{message}</p>
      <p
        data-testid="signed-proofs"
        className="dark:text-vega-light-300 text-vega-dark-300"
      >
        {t('Involved in %s %s', [
          signedProofs.length.toString(),
          signedProofs.length !== 1 ? t('markets') : t('market'),
        ])}
      </p>
      {links.length > 0 && (
        <div className="flex flex-row gap-1">
          {links.map((link) => (
            <ExternalLink
              key={link.url}
              href={link.url}
              data-testid={link.url}
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
