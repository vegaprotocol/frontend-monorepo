import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';
import { isBrowserWalletInstalled } from '@vegaprotocol/utils';

interface Props {
  lead?: string;
}

export const GetStarted = ({ lead }: Props) => {
  const { pubKey } = useVegaWallet();

  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const CANONICAL_URL = VEGA_NETWORKS[VEGA_ENV] || 'https://console.vega.xyz';

  const [, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );

  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const onButtonClick = () => {
    openVegaWalletDialog();
    setOnboardingViewed('true');
  };

  if (!pubKey && !isBrowserWalletInstalled()) {
    return (
      <div
        className={classNames(
          'flex flex-col bg-vega-blue-300 dark:bg-vega-blue-700 border border-vega-blue-350 dark:border-vega-blue-650 px-6 py-8 gap-4',
          { 'mt-8': !lead }
        )}
      >
        {lead && <div>{lead}</div>}
        <div>{t('Get started')}</div>
        <div>
          <ul className="list-decimal list-inside">
            <li>{t('Get a Vega wallet')}</li>
            <li>{t('Connect')}</li>
            <li>{t('Deposit funds')}</li>
            <li>{t('Open a position')}</li>
          </ul>
        </div>
        <div>
          <TradingButton
            intent={Intent.Info}
            onClick={onButtonClick}
            className="block w-full"
          >
            {t('Get started')}
          </TradingButton>
        </div>
        {VEGA_ENV === 'MAINNET' && (
          <div className="text-sm">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Fairground Testnet')}
            </ExternalLink>
          </div>
        )}
        {VEGA_ENV === 'TESTNET' && (
          <div className="text-sm">
            {t('Ready to trade with real funds?')}{' '}
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
