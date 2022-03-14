import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { StatusMessage } from '../../../components/status-message';
import { BlocksData, BlocksRefetch } from '../../../components/blocks';
import { JumpToBlock } from '../../../components/jump-to-block';

const Blocks = () => {
  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <section>
      <RouteTitle>Blocks</RouteTitle>
      {loading && <StatusMessage>Loading...</StatusMessage>}
      {error && <StatusMessage>Error: {error}</StatusMessage>}
      {data && (
        <>
          <BlocksRefetch refetch={refetch} />
          <BlocksData data={data} className="mb-28" />
        </>
      )}
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
