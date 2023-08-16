import { useEnvironment } from '@vegaprotocol/environment';
import { useFetch } from '@vegaprotocol/react-helpers';
import type { TendermintBlockResponse } from '../types';

export const useBlockInfo = (blockHeight?: number, canFetch = true) => {
  const { TENDERMINT_URL } = useEnvironment();

  const url = `${TENDERMINT_URL}/block?height=${blockHeight || ''}`;
  const canFetchData = Boolean(
    TENDERMINT_URL && blockHeight && !isNaN(blockHeight) && canFetch
  );

  const { state, refetch } = useFetch<TendermintBlockResponse>(
    url,
    { cache: 'force-cache' },
    canFetchData
  );

  return { state, refetch };
};
