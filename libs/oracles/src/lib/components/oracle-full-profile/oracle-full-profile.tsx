import { t } from '@vegaprotocol/i18n';
import type { Provider } from '../../oracle-schema';
import {
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
}: {
  provider: Provider;
  id: string;
}) => {
  const { message } = getVerifiedStatusIcon(provider);
  const { VEGA_EXPLORER_URL } = useEnvironment();

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
    <div className="flex flex-col gap-4">
      <p className="dark:text-vega-light-300 text-vega-dark-300 pb-2">
        {message}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-1">
          <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase">
            {t('%s verified accounts', links.length.toString())}
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
        <div className="col-span-1 gap-1 py-2 flex flex-col">
          <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase">
            {t('Details')}
          </p>
          {id && (
            <ExternalLink href={`${VEGA_EXPLORER_URL}/oracles/${id}`}>
              {t('Block explorer')}
            </ExternalLink>
          )}
          {provider.github_link && (
            <ExternalLink href={provider.github_link}>
              {t('Oracle repository')}
            </ExternalLink>
          )}
        </div>
      </div>

      <div>
        <p className="dark:text-vega-light-300 text-vega-dark-300 uppercase">
          {t('Oracle in %s %s', [
            signedProofs.length.toString(),
            signedProofs.length === 1 ? 'market' : 'markets',
          ])}
        </p>
      </div>
    </div>
  );
};
