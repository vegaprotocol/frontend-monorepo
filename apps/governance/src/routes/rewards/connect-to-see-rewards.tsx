import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import { Button } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../components/heading';

export const ConnectToSeeRewards = () => {
  const { openVegaWalletDialog } = useVegaWalletDialogStore((store) => ({
    openVegaWalletDialog: store.openVegaWalletDialog,
  }));
  const { t } = useTranslation();

  const classes = classNames(
    'flex flex-col items-center justify-center h-[300px] w-full',
    'border border-vega-dark-200'
  );

  return (
    <div className={classes}>
      <SubHeading title={t('toSeeYourRewardsConnectYourWallet')} />
      <Button
        data-testid="connect-to-vega-wallet-btn"
        onClick={() => {
          openVegaWalletDialog();
        }}
      >
        {t('connectVegaWallet')}
      </Button>
    </div>
  );
};
