import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { remove0x, useFetch } from '@vegaprotocol/react-helpers';
import { DATA_SOURCES } from '../../../config';
import { RenderFetched } from '../../../components/render-fetched';
import { TxDetails } from './tx-details';
import type { BlockExplorerTransaction } from '../../../routes/types/block-explorer-response';
import { toNonHex } from '../../../components/search/detect-search';
import { PageHeader } from '../../../components/page-header';
import { Routes } from '../../../routes/route-names';
import { IconNames } from '@blueprintjs/icons';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { useDocumentTitle } from '../../../hooks/use-document-title';

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const hash = txHash ? toNonHex(txHash) : '';
  let errorMessage: string | undefined = undefined;

  useDocumentTitle(['Transactions', `TX ${txHash}`]);

  const {
    state: { data, loading, error },
  } = useFetch<BlockExplorerTransaction>(
    `${DATA_SOURCES.blockExplorerUrl}/transactions/${toNonHex(hash)}`
  );

  if (error) {
    if (remove0x(hash).length !== 64) {
      errorMessage = 'Invalid transaction hash';
    }
  }

  return (
    <section>
      <Link
        className="font-normal underline underline-offset-4 block mb-5"
        to={`/${Routes.TX}`}
      >
        <Icon
          className="text-vega-light-300 dark:text-vega-light-300"
          name={IconNames.CHEVRON_LEFT}
        />
        All Transactions
      </Link>

      <PageHeader
        title="transaction"
        truncateStart={5}
        truncateEnd={9}
        className="mb-5"
      />

      <RenderFetched
        error={error}
        loading={loading}
        errorMessage={errorMessage}
      >
        <TxDetails
          className="mb-28"
          txData={data?.transaction}
          pubKey={data?.transaction.submitter}
        />
      </RenderFetched>
    </section>
  );
};

export { Tx };
