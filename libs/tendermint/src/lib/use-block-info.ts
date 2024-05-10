import { ENV, useEnvironment } from '@vegaprotocol/environment';
import { useFetch } from '@vegaprotocol/react-helpers';
import type {
  TendermintBlockResponse,
  TendermintErrorResponse,
} from '../types';

type TendermintResponse = TendermintBlockResponse | TendermintErrorResponse;

export const useBlockInfo = (blockHeight?: number, canFetch = true) => {
  const { TENDERMINT_URL } = useEnvironment();

  const url = `${TENDERMINT_URL}/block?height=${blockHeight || ''}`;
  const canFetchData = Boolean(
    TENDERMINT_URL && blockHeight && !isNaN(blockHeight) && canFetch
  );

  const { state, refetch } = useFetch<TendermintResponse>(
    url,
    { cache: 'force-cache' },
    canFetchData
  );

  return { state, refetch };
};

export const retrieveBlockInfo = async (blockHeight?: number) => {
  const TENDERMINT_URL = ENV.TENDERMINT_URL;
  const url = `${TENDERMINT_URL}/block?height=${blockHeight || ''}`;
  const canFetchData = Boolean(
    TENDERMINT_URL && blockHeight && !isNaN(blockHeight)
  );

  if (!canFetchData) return null;

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    const data = (await response.json()) as TendermintResponse;
    if (!response.ok && !data) {
      throw new Error(response.statusText);
    }
    return data;
  } catch {
    return null;
  }
};
