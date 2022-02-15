import React from "react";
import { useParams } from "react-router-dom";
import { DATA_SOURCES } from "../../../config";
import useFetch from "../../../hooks/use-fetch";
import { ChainExplorerTxResponse } from "../../types/chain-explorer-response";
import { TendermintTransactionResponse } from "../tendermint-transaction-response.d";

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const { data: transactionData } = useFetch<TendermintTransactionResponse>(
    `${DATA_SOURCES.tendermintUrl}/tx?hash=${txHash}`
  );
  const { data: decodedData } = useFetch<ChainExplorerTxResponse>(
    DATA_SOURCES.chainExplorerUrl,
    {
      method: "POST",
      body: JSON.stringify({
        tx_hash: txHash,
        node_url: `${DATA_SOURCES.tendermintUrl}/`,
      }),
    }
  );

  return (
    <section>
      <h1>Tx</h1>
      <h2>Tendermint Data</h2>
      <pre>{JSON.stringify(transactionData, null, "  ")}</pre>
      <h2>Decoded data</h2>
      <pre>{JSON.stringify(decodedData, null, "  ")}</pre>
    </section>
  );
};

export { Tx };
