import React from "react";
import { DATA_SOURCES } from "../../../config";
import useFetch from "../../../hooks/use-fetch";
import { TendermintUnconfirmedTransactionsResponse } from "../tendermint-unconfirmed-transactions-response.d";

const Txs = () => {
  const { data: unconfirmedTransactions } =
    useFetch<TendermintUnconfirmedTransactionsResponse>(
      `${DATA_SOURCES.tendermintUrl}/unconfirmed_txs`
    );

  return (
    <section>
      <h1>Tx</h1>
      <h2>Unconfirmed transactions</h2>
      https://lb.testnet.vega.xyz/tm/unconfirmed_txs
      <br />
      <div>Number: {unconfirmedTransactions?.result?.n_txs || 0}</div>
      <br />
      <div>
        <br />
        {JSON.stringify(unconfirmedTransactions, null, "  ")}
      </div>
    </section>
  );
};

export { Txs };
