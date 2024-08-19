import { cn } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { useDialogStore } from '@vegaprotocol/wallet-react';
import { Button } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../components/heading';

export const ConnectToSeeRewards = () => {
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const { t } = useTranslation();

  const classes = cn(
    'flex flex-col items-center justify-center h-[300px] w-full',
    'border border-gs-300 dark:border-gs-700'
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
