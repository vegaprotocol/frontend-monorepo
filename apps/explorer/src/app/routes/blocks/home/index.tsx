import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { BlocksData, BlocksRefetch } from '../../../components/blocks';
import { JumpToBlock } from '../../../components/jump-to-block';

const Blocks = () => {
  const {
    state: { data },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <section>
      <RouteTitle>Blocks</RouteTitle>
      <BlocksRefetch refetch={refetch} />
      <BlocksData data={data} className="mb-28" />
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
