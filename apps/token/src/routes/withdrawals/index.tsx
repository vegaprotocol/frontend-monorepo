import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import {
  PendingWithdrawalsTable,
  useWithdrawals,
  WithdrawalDialogs,
  WithdrawalsTable,
} from '@vegaprotocol/withdraws';
import { useState } from 'react';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '../index';

const Withdrawals = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
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
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const { t } = useTranslation();
  const { pending, completed, loading, error } = useWithdrawals();

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
        {pending && pending.length > 0 && (
          <PendingWithdrawalsTable rowData={pending} />
        )}
        <h4 className="pt-3 pb-1">{t('Withdrawal history')}</h4>
        <WithdrawalsTable rowData={completed} />
      </div>
      <WithdrawalDialogs
        withdrawDialog={withdrawDialog}
        setWithdrawDialog={setWithdrawDialog}
      />
    </>
  );
};

export default Withdrawals;
