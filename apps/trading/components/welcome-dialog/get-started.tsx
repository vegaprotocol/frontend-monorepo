import { t } from '@vegaprotocol/i18n';
import { Button, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import type { Networks } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';
import { useEnvironment } from '@vegaprotocol/environment';
import { isBrowserWalletInstalled } from '@vegaprotocol/utils';

export const GetStarted = () => {
  const { pubKey } = useVegaWallet();

  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const CANONICAL_URL = VEGA_NETWORKS[VEGA_ENV] || 'https://console.vega.xyz';

  const [_onBoardingViewed, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );

  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const onButtonClick = () => {
    openVegaWalletDialog();
    setOnboardingViewed('true');
  };

  if (!pubKey && isBrowserWalletInstalled()) {
    return (
      <div className="flex flex-col bg-vega-blue-700 dark:bg-vega-blue-700 border border-vega-blue-650 dark:border-vega-blue-650 px-6 py-8 gap-4 text-vega-cdark-50">
        <div className="">
          {t(
            'Start trading on the worlds most advanced decentralised exchange.'
          )}
        </div>
        <div className="">{t('Get started')}</div>
        <div className="">
          <ul className="list-decimal list-inside">
            <li>{t('Get a Vega wallet')}</li>
            <li>{t('Connect')}</li>
            <li>{t('Deposit funds')}</li>
            <li>{t('Open a position')}</li>
          </ul>
        </div>
        <div className="">
          <Button
            fill
            onClick={onButtonClick}
            className="bg-vega-blue-650 border-vega-blue-650 hover:bg-vega-blue-650 hover:border-vega-blue-650 dark:hover:bg-vega-blue-650 dark:hover:border-vega-blue-650"
          >
            {t('Get started')}
          </Button>
        </div>
        {VEGA_ENV === 'MAINNET' && (
          <div className="">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Fairground Testnet')}
            </ExternalLink>
          </div>
        )}
        {VEGA_ENV === 'TESTNET' && (
          <div className="">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Switch to Mainnet')}
            </ExternalLink>
          </div>
        )}
      </div>
    );
  }
  return null;
};
