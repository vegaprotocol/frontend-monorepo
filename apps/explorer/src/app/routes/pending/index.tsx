import React from 'react';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import type { TendermintUnconfirmedTransactionsResponse } from '../txs/tendermint-unconfirmed-transactions-response.d';
import { TxList } from '../../components/txs';
import { RouteTitle } from '../../components/route-title';

const PendingTxs = () => {
  const {
    state: { data: unconfirmedTransactions },
  } = useFetch<TendermintUnconfirmedTransactionsResponse>(
    `${DATA_SOURCES.tendermintUrl}/unconfirmed_txs`
  );

  return (
    <section>
      <RouteTitle data-testid="unconfirmed-transactions-header">
        Unconfirmed transactions
      </RouteTitle>
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
