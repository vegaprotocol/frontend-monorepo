import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import Routes from '../../routes/routes';

export const RiskMessage = () => {
  return (
    <>
      <div className="bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 p-6 mb-6">
        <ul className="list-disc ml-6 text-lg">
          <li>
            {t(
              'You may encounter bugs, loss of functionality or loss of assets using the App.'
            )}
          </li>
          <li>
            {t(
              'No party accepts any liability for any losses whatsoever related to its use.'
            )}
          </li>
        </ul>
      </div>
      <p className="mb-8">
        {t(
          'By using the Vega Governance App, you acknowledge that you have read and understood the'
        )}{' '}
        <ExternalLink href={Routes.DISCLAIMER} className="underline">
          <span className="flex items-center gap-2">
            <span>{t('Vega Governance Disclaimer')}</span>
            <Icon name="arrow-top-right" size={3} />
          </span>
        </ExternalLink>
        .
      </p>
    </>
  );
};
