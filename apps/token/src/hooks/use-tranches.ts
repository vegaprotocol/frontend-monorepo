import { useFetch } from '@vegaprotocol/react-helpers';
import type { Tranche } from '@vegaprotocol/smart-contracts';
import React, { useEffect } from 'react';
import type { Networks } from '@vegaprotocol/environment';
import { useEnvironment } from '@vegaprotocol/environment';

import { BigNumber } from '../lib/bignumber';

const TRANCHES_URLS: { [N in Networks]: string } = {
  MAINNET: 'https://static.vega.xyz/assets/mainnet-tranches.json',
  TESTNET: 'https://static.vega.xyz/assets/testnet-tranches.json',
  STAGNET: 'https://static.vega.xyz/assets/stagnet1-tranches.json',
  STAGNET3: 'https://static.vega.xyz/assets/stagnet2-tranches.json',
  DEVNET: 'https://static.vega.xyz/assets/devnet-tranches.json',
  CUSTOM: 'https://static.vega.xyz/assets/testnet-tranches.json',
};

export function useTranches() {
  const { VEGA_ENV } = useEnvironment();
  const [tranches, setTranches] = React.useState<Tranche[] | null>(null);
  const url = React.useMemo(() => TRANCHES_URLS[VEGA_ENV], [VEGA_ENV]);
  const {
    state: { data, loading, error },
  } = useFetch<Tranche[] | null>(url);
  useEffect(() => {
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
