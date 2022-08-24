import { Button, Dialog, Splash } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import {
  useWithdrawals,
  WithdrawalsTable,
  WithdrawFormContainer,
} from '@vegaprotocol/withdraws';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';

const Withdrawals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawalsTitle')} />
      <VegaWalletContainer>
        {(currVegaKey) => <WithdrawPendingContainer />}
      </VegaWalletContainer>
    </>
  );
};

const WithdrawPendingContainer = () => {
  const { keypair } = useVegaWallet();
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const { t } = useTranslation();
  const { withdrawals, loading, error } = useWithdrawals();

  if (error) {
    return (
      <section>
        <p>{t('Something went wrong')}</p>
        {error && <pre>{error.message}</pre>}
      </section>
    );
  }

  if (loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <h2>{t('withdrawalsPreparedWarningHeading')}</h2>
        <Button onClick={() => setWithdrawDialog(true)}>Withdraw</Button>
      </header>
      <p>{t('withdrawalsText')}</p>
      <p className="mb-8">{t('withdrawalsPreparedWarningText')}</p>
      <div className="w-full h-[500px]">
        <WithdrawalsTable withdrawals={withdrawals} />
      </div>
      <Dialog
        title={t('Withdraw')}
        open={withdrawDialog}
        onChange={(isOpen) => setWithdrawDialog(isOpen)}
      >
        <WithdrawFormContainer partyId={keypair?.pub} />
      </Dialog>
    </>
  );
};

export default Withdrawals;
