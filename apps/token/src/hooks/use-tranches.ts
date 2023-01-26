import { toBigNum, useFetch } from '@vegaprotocol/react-helpers';
import type { TrancheServiceResponse } from '@vegaprotocol/smart-contracts';
import { useMemo } from 'react';
import type { BigNumber } from '../lib/bignumber';
import { ENV } from '../config';
import { useAppState } from '../contexts/app-state/app-state-context';

export interface Tranche {
  tranche_id: number;
  tranche_start: Date;
  tranche_end: Date;
  total_added: BigNumber;
  total_removed: BigNumber;
  locked_amount: BigNumber;
  users: {
    address: string;
    balance: BigNumber;
  }[];
}

const secondsToDate = (seconds: number) => new Date(seconds * 1000);

export function useTranches() {
  const {
    appState: { decimals },
  } = useAppState();
  const url = `${ENV.tranchesServiceUrl}/tranches/stats`;
  const {
    state: { data, loading, error },
  } = useFetch<TrancheServiceResponse | null>(url);
  const tranches = useMemo(() => {
    const now = Math.round(Date.now() / 1000);
    if (!data?.tranches) {
      return null;
    }
    const tranches = Object.values(data.tranches)
      ?.map((t) => {
        const tranche_progress =
          t.duration !== 0 ? (now - t.cliff_start) / t.duration : 0;
        const lockedDecimal = tranche_progress < 0 ? 1 : 1 - tranche_progress;
        return {
          tranche_id: t.tranche_id,
          tranche_start: secondsToDate(t.cliff_start),
          tranche_end: secondsToDate(t.cliff_start + t.duration),
          total_added: toBigNum(t.initial_balance, decimals),
          total_removed: toBigNum(t.initial_balance, decimals).minus(
            toBigNum(t.current_balance, decimals)
          ),
          locked_amount: toBigNum(t.initial_balance, decimals).times(
            lockedDecimal
          ),
          users: t.users.map((u) => ({
            address: u.address,
            balance: toBigNum(u.balance, decimals),
          })),
        };
      })
      .sort((a, b) => a.tranche_id - b.tranche_id);
    return tranches;
  }, [data, decimals]);

  return {
    tranches,
    loading,
    error,
  };
}
