import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
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
    <>
      <section>
        <h1 className="route-header">Blocks</h1>
        <BlocksRefetch refetch={refetch} />
        <BlocksTable data={data} />
      </section>

      <JumpToBlock />
    </>
  );
};

export { Blocks };
