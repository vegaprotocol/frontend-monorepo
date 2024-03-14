import { t } from '@vegaprotocol/i18n';
import {
  ExternalLink,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import Routes from '../../routes/routes';

export const RiskMessage = () => {
  return (
    <>
      <div className="bg-vega-light-100 dark:bg-vega-dark-100 p-6">
        <ul className="list-[square] ml-4">
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
      <p>
        {t(
          'By using the Vega Governance App, you acknowledge that you have read and understood the'
        )}{' '}
        <ExternalLink href={Routes.DISCLAIMER} className="underline">
          <span className="flex items-center gap-1">
            <span>{t('Vega Governance Disclaimer')}</span>
            <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
          </span>
        </ExternalLink>
        .
      </p>
    </>
  );
};
