import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';

import { Heading } from '../../components/heading';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import {
  withdrawalProvider,
  useWithdrawalDialog,
  WithdrawalsTable,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { RouteChildProps } from '../index';

const Withdrawals = ({ name }: RouteChildProps) => {
  useDocumentTitle(name);
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();

  return (
    <>
      <Heading title={t('withdrawalsTitle')} />
      {!pubKey && <p className="mb-8">{t('withdrawalsSubtitle')}</p>}
      <VegaWalletContainer>
        {() => <WithdrawPendingContainer />}
      </VegaWalletContainer>
    </>
  );
};

const WithdrawPendingContainer = () => {
  const openWithdrawalDialog = useWithdrawalDialog((state) => state.open);
  const { t } = useTranslation();
  const { pubKey } = useVegaWallet();
  const { data, loading, error } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });

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
        <Button data-testid="withdraw" onClick={() => openWithdrawalDialog()}>
          Withdraw
        </Button>
      </header>
      <p>{t('withdrawalsText')}</p>
      <p className="mb-8">{t('withdrawalsPreparedWarningText')}</p>
      <div className="w-full h-[500px]">
        <WithdrawalsTable rowData={data} />
      </div>
    </>
  );
};

export default Withdrawals;
