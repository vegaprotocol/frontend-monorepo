import { useFetch } from '@vegaprotocol/react-helpers';
import { DATA_SOURCES } from '../config';

type PubKey = {
  type: string;
  value: string;
};

type Validator = {
  address: string;
  pub_key: PubKey;
  voting_power: string;
  proposer_priority: string;
};

type Result = {
  block_height: string;
  validators: Validator[];
  count: string;
  total: string;
};

type TendermintValidatorsResponse = {
  jsonrpc: string;
  id: number;
  result: Result;
};

export const useTendermintValidators = () => {
  const {
    state: { data, loading, error },
    refetch,
  } = useFetch<TendermintValidatorsResponse>(
    `${DATA_SOURCES.tendermintUrl}/validators`
  );

  return { data, loading, error, refetch };
};
