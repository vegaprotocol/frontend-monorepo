import { t } from '@vegaprotocol/i18n';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Routes } from '../../pages/client-router';
import { Link } from 'react-router-dom';

export const RiskMessage = () => {
  return (
    <>
      <div className="bg-vega-light-100 dark:bg-vega-dark-100 p-6 mb-6">
        <ul className="list-[square] ml-4">
          <li className="mb-1">
            {t(
              'Conduct your own due diligence and consult your financial advisor before making any investment decisions.'
            )}
          </li>
          <li className="mb-1">
            {t(
              'You may encounter bugs, loss of functionality or loss of assets.'
            )}
          </li>
          <li>
            {t('No party accepts any liability for any losses whatsoever.')}
          </li>
        </ul>
      </div>
      <p className="mb-8">
        {t(
          'By using the Vega Console, you acknowledge that you have read and understood the'
        )}{' '}
        <Link className="underline" to={Routes.DISCLAIMER} target="_blank">
          <span className="flex items-center gap-1">
            <span>{t('Vega Console Disclaimer')}</span>
            <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
          </span>
        </Link>
      </p>
    </>
  );
};
