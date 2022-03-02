import React from 'react';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import { TendermintUnconfirmedTransactionsResponse } from '../txs/tendermint-unconfirmed-transactions-response.d';
import { TxList } from '../../components/txs';

const PendingTxs = () => {
  const {
    state: { data: unconfirmedTransactions },
  } = useFetch<TendermintUnconfirmedTransactionsResponse>(
    `${DATA_SOURCES.tendermintUrl}/unconfirmed_txs`
  );

  return (
    <section>
      <h1>Unconfirmed transactions</h1>
      https://lb.testnet.vega.xyz/tm/unconfirmed_txs
      <br />
      <div>Number: {unconfirmedTransactions?.result?.n_txs || 0}</div>
      <br />
      <div>
        <br />
        <TxList data={unconfirmedTransactions} />
      </div>
    </section>
  );
};

export { PendingTxs };
