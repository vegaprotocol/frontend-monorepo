import React from 'react';
import { DATA_SOURCES } from '../../config';
import type { TendermintUnconfirmedTransactionsResponse } from '../txs/tendermint-unconfirmed-transactions-response.d';
import { TxList } from '../../components/txs';
import { RouteTitle } from '../../components/route-title';
import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { useDocumentTitle } from '../../hooks/use-document-title';

const PendingTxs = () => {
  const {
    state: { data: unconfirmedTransactions },
  } = useFetch<TendermintUnconfirmedTransactionsResponse>(
    `${DATA_SOURCES.tendermintUrl}/unconfirmed_txs`
  );

  useDocumentTitle(['Pending transactions']);

  return (
    <section>
      <RouteTitle data-testid="unconfirmed-transactions-header">
        {t('Unconfirmed transactions')}
      </RouteTitle>
      <br />
      <div>{t(`Number: ${unconfirmedTransactions?.result?.n_txs || 0}`)}</div>
      <br />
      <div>
        <br />
        <TxList data={unconfirmedTransactions} />
      </div>
    </section>
  );
};

export { PendingTxs };
