import { useParams } from 'react-router-dom';
import { remove0x } from '@vegaprotocol/utils';
import { useFetch } from '@vegaprotocol/react-helpers';
import { DATA_SOURCES } from '../../../config';
import { TxDetails } from './tx-details';
import type { BlockExplorerTransaction } from '../../../routes/types/block-explorer-response';
import { toNonHex } from '../../../components/search/detect-search';
import { PageHeader } from '../../../components/page-header';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDocumentTitle } from '../../../hooks/use-document-title';

const Tx = () => {
  const { txHash } = useParams<{ txHash: string }>();
  const hash = txHash ? toNonHex(txHash) : '';
  let errorMessage: string | undefined = undefined;

  useDocumentTitle(['Transactions', `TX ${txHash}`]);

  const {
    state: { data, loading, error }
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
      <PageHeader
        title="transaction"
        truncateStart={5}
        truncateEnd={9}
        className="mb-5"
      />

      <AsyncRenderer
        data={data}
        noDataCondition={(data) => !data || !data.transaction}
        error={error}
        loading={!!loading}
        errorMessage={errorMessage}
      >
        <TxDetails
          className="mb-28"
          txData={data?.transaction}
          pubKey={data?.transaction.submitter}
        />
      </AsyncRenderer>
    </section>
  );
};

export { Tx };
