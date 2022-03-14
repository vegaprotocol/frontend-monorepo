import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
import { RouteTitle } from '../../../components/route-title';
import { BlocksTable, BlocksRefetch } from '../../../components/blocks';
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
      <BlocksTable data={data} />
      <JumpToBlock />
    </section>
  );
};

export { Blocks };
