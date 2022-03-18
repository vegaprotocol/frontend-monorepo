import { TendermintUnconfirmedTransactionsResponse } from '../../../routes/txs/tendermint-unconfirmed-transactions-response.d';

interface TxsProps {
  data: TendermintUnconfirmedTransactionsResponse | undefined;
}

export const TxList = ({ data }: TxsProps) => {
  if (!data) {
    return <div>Awaiting transactions</div>;
  }

  return <div>{JSON.stringify(data, null, '  ')}</div>;
};
