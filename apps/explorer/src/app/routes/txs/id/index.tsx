import React from 'react';
import { useParams } from 'react-router-dom';
import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { ChainExplorerTxResponse } from '../../types/chain-explorer-response';
import { TendermintTransactionResponse } from '../tendermint-transaction-response.d';
import { TxDetails, TxContent } from '../../../components/transaction';

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const { data: transactionData } = useFetch<TendermintTransactionResponse>(
    `${DATA_SOURCES.tendermintUrl}/tx?hash=${txHash}`
  );
  const { data: decodedData } = useFetch<ChainExplorerTxResponse>(
    DATA_SOURCES.chainExplorerUrl,
    {
      method: 'POST',
      body: JSON.stringify({
        tx_hash: txHash,
        node_url: `${DATA_SOURCES.tendermintUrl}/`,
      }),
    }
  );

  return (
    <section>
      <h1>Transaction details</h1>
      <TxDetails
        txData={transactionData?.result}
        pubKey={decodedData?.PubKey}
      />
      <h2>Transaction content</h2>
      <TxContent data={decodedData} />
    </section>
  );
};

export { Tx };
