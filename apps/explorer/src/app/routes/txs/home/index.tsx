import useFetch from '../../../hooks/use-fetch';
import { TendermintBlockchainResponse } from '../../blocks/tendermint-blockchain-response';
import { DATA_SOURCES } from '../../../config';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { TxsData } from '../../../components/txs';
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
      <TxsData data={data} />
      <JumpToBlock />
    </section>
  );
};

export { Txs };
