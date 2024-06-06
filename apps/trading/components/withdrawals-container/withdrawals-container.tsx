import { Splash } from '@vegaprotocol/ui-toolkit';
import {
  WithdrawalsTable,
  useIncompleteWithdrawals,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';

export const WithdrawalsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, error } = useWithdrawals({ pubKey });
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
