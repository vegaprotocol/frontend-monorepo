import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../../blocks/tendermint-blockchain-response';
import { DATA_SOURCES } from '../../../config';
import { BlocksTable, BlocksRefetch } from '../../../components/blocks';
import { JumpToBlock } from '../../../components/jump-to-block';

const Txs = () => {
  const {
    state: { data },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <section>
      <RouteTitle>Transactions</RouteTitle>
      <BlocksRefetch refetch={refetch} />
      <BlocksTable data={data} showTransactions={true} />
      <JumpToBlock />
    </section>
  );
};

export { Txs };
