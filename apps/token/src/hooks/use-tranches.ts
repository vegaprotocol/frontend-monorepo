import { useFetch } from '@vegaprotocol/react-helpers';
import type { Tranche } from '@vegaprotocol/smart-contracts';
import React, { useEffect } from 'react';
import { BigNumber } from '../lib/bignumber';
import { ENV } from '../config';

export function useTranches() {
  const [tranches, setTranches] = React.useState<Tranche[] | null>(null);
  const url = `${ENV.tranchesServiceUrl}/tranches/stats`;
  console.log(url);
  const {
    state: { data, loading, error },
  } = useFetch<Tranche[] | null>(url);
  useEffect(() => {
    console.log(data);
    const processedTrances = data
      ?.map((t) => ({
        ...t,
        tranche_start: new Date(t.tranche_start),
        tranche_end: new Date(t.tranche_end),
        total_added: new BigNumber(t.total_added),
        total_removed: new BigNumber(t.total_removed),
        locked_amount: new BigNumber(t.locked_amount),
        deposits: t.deposits.map((d) => ({
          ...d,
          amount: new BigNumber(d.amount),
        })),
        withdrawals: t.withdrawals.map((w) => ({
          ...w,
          amount: new BigNumber(w.amount),
        })),
        users: t.users.map((u) => ({
          ...u,
          // @ts-ignore - types are incorrect in the SDK lib
          deposits: u.deposits.map((d) => ({
            ...d,
            amount: new BigNumber(d.amount),
          })),
          // @ts-ignore - types are incorrect in the SDK lib
          withdrawals: u.withdrawals.map((w) => ({
            ...w,
            amount: new BigNumber(w.amount),
          })),
          total_tokens: new BigNumber(u.total_tokens),
          withdrawn_tokens: new BigNumber(u.withdrawn_tokens),
          remaining_tokens: new BigNumber(u.remaining_tokens),
        })),
      }))
      .sort((a: Tranche, b: Tranche) => a.tranche_id - b.tranche_id);
    setTranches(processedTrances ? processedTrances : null);
  }, [data]);

  return {
    tranches,
    loading,
    error,
  };
}
