import React from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../../../hooks/use-fetch';
import { TendermintTransactionResponse } from '../tendermint-transaction-response.d';
import { ChainExplorerTxResponse } from '../../types/chain-explorer-response';
import { DATA_SOURCES } from '../../../config';
import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
import { TxContent } from './tx-content';
import { TxDetails } from './tx-details';

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();

  const {
    state: { data: tTxData, loading: tTxLoading, error: tTxError },
  } = useFetch<TendermintTransactionResponse>(
    `${DATA_SOURCES.tendermintUrl}/tx?hash=${txHash}`
  );

  const {
    state: { data: ceTxData, loading: ceTxLoading, error: ceTxError },
  } = useFetch<ChainExplorerTxResponse>(DATA_SOURCES.chainExplorerUrl, {
    method: 'POST',
    body: JSON.stringify({
      tx_hash: txHash,
      node_url: `${DATA_SOURCES.tendermintUrl}/`,
    }),
  });

  return (
    <section>
      <RouteTitle>Transaction details</RouteTitle>

      <RenderFetched error={tTxError} loading={tTxLoading}>
        <TxDetails
          className="mb-28"
          txData={tTxData?.result}
          pubKey={ceTxData?.PubKey}
        />
      </RenderFetched>

      <h2 className="text-h4 uppercase mb-16">Transaction content</h2>
      <RenderFetched error={ceTxError} loading={ceTxLoading}>
        <TxContent data={ceTxData} />
      </RenderFetched>
    </section>
  );
};

export { Tx };
