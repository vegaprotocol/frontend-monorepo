import { toBigNum } from '@vegaprotocol/utils';
import type { TrancheServiceResponse } from '@vegaprotocol/smart-contracts';
import type BigNumber from 'bignumber.js';
import { create } from 'zustand';
import { ENV } from '../../config';

export interface Tranche {
  tranche_id: number;
  tranche_start: Date;
  tranche_end: Date;
  total_added: BigNumber;
  total_removed: BigNumber;
  locked_amount: BigNumber;
  users: string[];
}

const URL = `${ENV.tranchesServiceUrl}/tranches/stats`;

export interface UserTrancheBalance {
  /** ID of tranche */
  id: number;

  /** Users vesting tokens on tranche */
  locked: BigNumber;

  /** Users vested tokens on tranche */
  vested: BigNumber;
}

export type TranchesStore = {
  tranches: Tranche[] | null;
  loading: boolean;
  error: Error | null;
  getTranches: (decimals: number) => void;
};

const secondsToDate = (seconds: number) => new Date(seconds * 1000);

export const useTranches = create<TranchesStore>()((set) => ({
  tranches: null,
  loading: false,
  error: null,
  getTranches: async (decimals: number) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(URL);
      const data = (await res.json()) as TrancheServiceResponse;
      const now = Math.round(Date.now() / 1000);
      const tranches = Object.values(data.tranches)
        ?.map((t) => {
          const tranche_progress =
            t.duration !== 0 ? (now - t.cliff_start) / t.duration : 0;
          let lockedDecimal;
          if (t.duration !== 0) {
            if (tranche_progress < 0) {
              lockedDecimal = 1;
            } else {
              lockedDecimal = 1 - tranche_progress;
            }
          } else {
            if (now < t.cliff_start) {
              lockedDecimal = 1;
            } else {
              lockedDecimal = 0;
            }
          }
          const clampedLockedDecimal = Math.max(0, Math.min(1, lockedDecimal));

          return {
            tranche_id: t.tranche_id,
            tranche_start: secondsToDate(t.cliff_start),
            tranche_end: secondsToDate(t.cliff_start + t.duration),
            total_added: toBigNum(t.initial_balance, decimals),
            total_removed: toBigNum(t.initial_balance, decimals).minus(
              toBigNum(t.current_balance, decimals)
            ),
            locked_amount: toBigNum(t.initial_balance, decimals).times(
              clampedLockedDecimal
            ),
            users: t.users,
          };
        })
        .sort((a, b) => a.tranche_id - b.tranche_id);
      set({
        tranches,
      });
    } catch (e) {
      set({ error: e as unknown as Error });
    } finally {
      set({
        loading: false,
      });
    }
  },
}));
