import { removePaginationWrapper } from '@vegaprotocol/utils';
import { useTotalVolumeLockedQuery } from './__generated__/TotalVolumeLocked';
import flatten from 'lodash/flatten';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

export const useTotalVolumeLocked = () => {
  const { data, loading, error } = useTotalVolumeLockedQuery({
    context: {
      isEnlargedTimeout: true,
    },
    fetchPolicy: 'cache-and-network',
    pollInterval: 1000 * 60 * 60, // 1h - no need
  });

  const value = useMemo(() => {
    const parties = removePaginationWrapper(data?.partiesConnection?.edges);
    const accounts = flatten(
      parties.map((p) => removePaginationWrapper(p.accountsConnection?.edges))
    );
    const nonVegaAccounts = accounts.filter(
      (a) => a.asset.symbol.toUpperCase() !== 'VEGA'
    );
    const balances = nonVegaAccounts.map((a) => {
      const value = BigNumber(a.balance).dividedBy(BigNumber(a.asset.quantum));
      return value;
    });
    return balances.reduce((all, v) => all.plus(v), BigNumber(0));
  }, [data?.partiesConnection?.edges]);

  return { tvl: value, loading, error };
};
