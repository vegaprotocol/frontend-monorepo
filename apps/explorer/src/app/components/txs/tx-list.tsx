import { t } from '@vegaprotocol/react-helpers';
import type { TendermintUnconfirmedTransactionsResponse } from '../../routes/txs/tendermint-unconfirmed-transactions-response.d';

interface TxsProps {
  data: TendermintUnconfirmedTransactionsResponse | undefined;
}

export const TxList = ({ data }: TxsProps) => {
  if (!data) {
    return <div>{t('Awaiting transactions')}</div>;
  }

  return <div>{JSON.stringify(data, null, '  ')}</div>;
};
