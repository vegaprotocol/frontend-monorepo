import { t } from '@vegaprotocol/i18n';
import type { Provider } from '../../oracle-schema';
import { Icon, Intent, Link } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@blueprintjs/icons';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

const getVerifiedStatusIcon = (provider: Provider) => {
  if (!provider.oracle.first_verified) {
    return {
      icon: IconNames.ERROR,
      message: t('Not verified'),
      intent: Intent.Danger,
    };
  }

  const firstVerified = new Date(provider.oracle.first_verified);
  return {
    icon: IconNames.TICK_CIRCLE,
    intent: Intent.Success,
    message: t(
      'Verified since %s',
      firstVerified.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    ),
  };
};

export const OracleBasicProfile = ({ provider }: { provider: Provider }) => {
  const { icon, message, intent } = getVerifiedStatusIcon(provider);
  return (
    <>
      <div className="">
        <Link href={provider.url}>{provider.name}</Link>
        <div
          className={classNames(
            {
              'text-gray-700 dark:text-gray-300': intent === Intent.None,
              'text-vega-blue': intent === Intent.Primary,
              'text-vega-green dark:text-vega-green': intent === Intent.Success,
              'text-yellow-600 dark:text-yellow': intent === Intent.Warning,
              'text-vega-pink': intent === Intent.Danger,
            },
            'flex items-start mt-1'
          )}
        >
          <Icon size={4} name={icon as IconName} />
        </div>
      </div>
      <p className="text-neutral">{message}</p>
      <div className="mt-2">
        <p>{t('Description')}</p>
        <ReactMarkdown>{provider.description_markdown}</ReactMarkdown>
      </div>
    </>
  );
};
