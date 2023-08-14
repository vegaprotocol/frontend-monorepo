import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  withdrawalProvider,
  WithdrawalsTable,
  useIncompleteWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const WithdrawalsContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { ready, delayed } = useIncompleteWithdrawals();
  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  return (
    <WithdrawalsTable
      data-testid="withdrawals-history"
      rowData={data}
      overlayNoRowsTemplate={error ? error.message : t('No withdrawals')}
      ready={ready}
      delayed={delayed}
    />
  );
};
