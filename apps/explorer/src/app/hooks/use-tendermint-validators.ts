import { useFetch } from '@vegaprotocol/react-helpers';
import { useEffect, useRef } from 'react';
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

export const useTendermintValidators = (
  pollInterval?: number,
  options?: RequestInit
) => {
  const {
    state: { data, loading, error },
    refetch,
  } = useFetch<TendermintValidatorsResponse>(
    `${DATA_SOURCES.tendermintUrl}/validators`,
    options || {}
  );

  const ref = useRef<TendermintValidatorsResponse | undefined>(undefined);
  useEffect(() => {
    if (data) ref.current = data;
  }, [data]);

  useEffect(() => {
    const interval =
      pollInterval &&
      setInterval(() => {
        refetch();
      }, pollInterval);
    return () => {
      clearInterval(interval);
    };
  }, [pollInterval, refetch]);

  return { data: ref.current, loading, error, refetch };
};
