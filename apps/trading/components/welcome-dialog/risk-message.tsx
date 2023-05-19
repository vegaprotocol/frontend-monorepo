import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Icon } from '@vegaprotocol/ui-toolkit';
import { Links, Routes } from '../../pages/client-router';

export const RiskMessage = () => {
  return (
    <>
      <div className="bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 p-6 mb-6">
        <ul className="list-disc ml-6 text-lg">
          <li>
            {t(
              'No party hosts or operates this IFPS website or offers any financial advice.'
            )}
          </li>
          <li>
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
        <ExternalLink
          href={`/#/${Links[Routes.DISCLAIMER]()}`}
          className="underline"
        >
          <span className="flex items-center gap-2">
            <span>{t('Vega Console Disclaimer')}</span>
            <Icon name="arrow-top-right" size={3} />
          </span>
        </ExternalLink>
        .
      </p>
    </>
  );
};
