import { useParams } from 'react-router-dom';
import { remove0x } from '@vegaprotocol/utils';
import { useFetch } from '@vegaprotocol/react-helpers';
import { DATA_SOURCES } from '../../../config';
import { RenderFetched } from '../../../components/render-fetched';
import { TxDetails } from './tx-details';
import { type BlockExplorerTransaction } from '../../../routes/types/block-explorer-response';
import { toNonHex } from '../../../components/search/detect-search';
import { PageHeader } from '../../../components/page-header';
import { useDocumentTitle } from '../../../hooks/use-document-title';

type Params = { txHash: string };

const Tx = () => {
  const { txHash } = useParams<Params>();
  const hash = txHash ? toNonHex(txHash) : '';
  let errorMessage: string | undefined = undefined;

  useDocumentTitle(['Transactions', `TX ${txHash}`]);

  const {
    state: { data, loading, error },
    refetch,
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

      <RenderFetched
        error={error}
        loading={loading}
        errorMessage={errorMessage}
        refetch={refetch}
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
