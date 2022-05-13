import type { TendermintBlockchainResponse } from '../../blocks/tendermint-blockchain-response';
import { DATA_SOURCES } from '../../../config';
import { RouteTitle } from '../../../components/route-title';
import { BlocksRefetch } from '../../../components/blocks';
import { RenderFetched } from '../../../components/render-fetched';
import { BlockTxsData } from '../../../components/txs';
import { JumpToBlock } from '../../../components/jump-to-block';
import { t, useFetch } from '@vegaprotocol/react-helpers';

const Txs = () => {
  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <section>
      <RouteTitle>{t('Transactions')}</RouteTitle>
      <RenderFetched error={error} loading={loading}>
        <>
          <BlocksRefetch refetch={refetch} />
          <BlockTxsData data={data} />
        </>
      </RenderFetched>
      <JumpToBlock />
    </section>
  );
};

export { Txs };
