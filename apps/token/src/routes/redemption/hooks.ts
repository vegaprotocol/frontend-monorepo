import { useCallback, useEffect, useState } from 'react';

import { useTranches } from '../../lib/tranches/tranches-store';
import { useContracts } from '../../contexts/contracts/contracts-context';
import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../contexts/app-state/app-state-context';

export const useUserTrancheBalances = (address: string | undefined) => {
  const [userTrancheBalances, setUserTrancheBalances] = useState<
    {
      id: number;
      locked: BigNumber;
      vested: BigNumber;
    }[]
  >([]);
  const {
    appState: { decimals },
  } = useAppState();
  const { vesting } = useContracts();
  const tranches = useTranches((state) => state.tranches);
  const loadUserTrancheBalances = useCallback(async () => {
    if (!address) return;
    const userTranches =
      tranches?.filter((t) =>
        t.users.some(
          (a) => a && address && a.toLowerCase() === address.toLowerCase()
        )
      ) || [];
    const trancheIds = [0, ...userTranches.map((t) => t.tranche_id)];
    const promises = trancheIds.map(async (tId) => {
      const [t, v] = await Promise.all([
        vesting.get_tranche_balance(address, tId),
        vesting.get_vested_for_tranche(address, tId),
      ]);

      const total = toBigNum(t, decimals);
      const vested = toBigNum(v, decimals);

      return {
        id: tId,
        locked: tId === 0 ? total : total.minus(vested),
        vested: tId === 0 ? new BigNumber(0) : vested,
      };
    });

    const trancheBalances = await Promise.all(promises);
    setUserTrancheBalances(trancheBalances);
  }, [address, decimals, tranches, vesting]);
  useEffect(() => {
    loadUserTrancheBalances();
  }, [loadUserTrancheBalances]);
  return userTrancheBalances;
};
