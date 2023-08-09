import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import {
  useVegaWallet,
  useVegaWalletDialogStore,
  isBrowserWalletInstalled,
} from '@vegaprotocol/wallet';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';

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

  const wrapperClasses = classNames(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650',
    { 'mt-8': !lead }
  );

  if (!pubKey && !isBrowserWalletInstalled()) {
    return (
      <div className={wrapperClasses} data-testid="get-started-banner">
        {lead && <h2>{lead}</h2>}
        <h3 className="text-lg">{t('Get started')}</h3>
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
            data-testid="get-started-button"
          >
            {t('Get started')}
          </TradingButton>
        </div>
        {VEGA_ENV === Networks.MAINNET && (
          <p className="text-sm">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Fairground Testnet')}
            </ExternalLink>
          </p>
        )}
        {VEGA_ENV === Networks.TESTNET && (
          <p className="text-sm">
            {t('Ready to trade with real funds?')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Switch to Mainnet')}
            </ExternalLink>
          </p>
        )}
      </div>
    );
  }

  if (!pubKey) {
    return (
      <div className={wrapperClasses}>
        <p className="text-sm mb-1">
          You need a{' '}
          <ExternalLink href="https://vega.xyz/wallet">
            Vega wallet
          </ExternalLink>{' '}
          to start trading in this market.
        </p>
        <TradingButton
          onClick={openVegaWalletDialog}
          size="small"
          data-testid="order-connect-wallet"
          intent={Intent.Info}
        >
          {t('Connect wallet')}
        </TradingButton>
      </div>
    );
  }

  return null;
};
