import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import type { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
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
      <RenderFetched error={error} loading={loading}>
        <>
          <BlocksRefetch refetch={refetch} />
          <BlocksData data={data} className="mb-28" />
        </>
      </RenderFetched>
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
