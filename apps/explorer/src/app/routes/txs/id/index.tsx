import React from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '@vegaprotocol/react-helpers';
import { DATA_SOURCES } from '../../../config';
import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
import { TxContent } from './tx-content';
import { TxDetails } from './tx-details';
import { t } from '@vegaprotocol/react-helpers';
import type { BlockExplorerTransaction } from '../../../routes/types/block-explorer-response';
import { toNonHex } from '../../../components/search/detect-search';

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const hash = txHash ? toNonHex(txHash) : '';

  const {
    state: { data, loading: tTxLoading, error: tTxError },
  } = useFetch<BlockExplorerTransaction>(
    `${DATA_SOURCES.blockExplorerUrl}/transactions/${toNonHex(hash)}`
  );

  return (
    <section>
      <RouteTitle>{t('Transaction details')}</RouteTitle>

      <RenderFetched error={tTxError} loading={tTxLoading}>
        <>
          <TxDetails
            className="mb-28"
            txData={data?.transaction}
            pubKey={data?.transaction.submitter}
          />

          <h2 className="text-2xl uppercase mb-4">
            {t('Transaction content')}
          </h2>

          <TxContent data={data?.transaction} />
        </>
      </RenderFetched>
    </section>
  );
};

export { Tx };
