import { useFetch } from '@vegaprotocol/react-helpers';
import { Txs } from './index';
import { DATA_SOURCES } from '../../../config';
import type { TendermintBlockchainResponse } from '../../blocks/tendermint-blockchain-response';

export const TxsHomeBlockHeightWrapper = () => {
  const {
    state: { data, error, loading },
    refetch,
  } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  const latestBlock = data?.result?.block_metas?.[0]?.header?.height;

  if (error) {
    return <div>{`Something went wrong: ${error.message}`}</div>;
  }

  if (loading) {
    return <div>{'Getting latest block height...'}</div>;
  }

  if (!data) {
    return <div>{'Could not get latest block height'}</div>;
  }

  // @ts-ignore latestBlock will be a string by this point (or would have been caught above)
  return <Txs latestBlockHeight={latestBlock} refresh={refetch} />;
};
