import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toAssetData, useEthereumConfig } from '@vegaprotocol/web3';
import {
  type WithdrawalFieldsFragment,
  withdrawalProvider,
} from '@vegaprotocol/withdraws';
import uniqBy from 'lodash/uniqBy';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '../wagmi-config';

export type TimestampedWithdrawals = {
  data: WithdrawalFieldsFragment;
  timestamp: number | undefined;
}[];

export const useIncompleteWithdrawals = () => {
  const { config } = useEthereumConfig();

  const [ready, setReady] = useState<TimestampedWithdrawals>([]);
  const [delayed, setDelayed] = useState<TimestampedWithdrawals>([]);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || isReadOnly,
  });
  // const getDelay = useGetWithdrawDelay(); // seconds
  const incompleteWithdrawals = useMemo(
    () => data?.filter((w) => !w.txHash),
    [data]
  );

  const assets = useMemo(
    () =>
      uniqBy(
        incompleteWithdrawals?.map((w) => w.asset),
        (a) => a.id
      ),
    [incompleteWithdrawals]
  );

  const checkWithdraws = useCallback(async () => {
    if (assets.length === 0) return;

    // TODO: with default wagmi setup we can only check the delay of the current connected chain
    const delay = await readContract(wagmiConfig, {
      abi: BRIDGE_ABI,
      address: config?.collateral_bridge_contract.address as `0x${string}`,
      functionName: 'default_withdraw_delay',
    });

    const thresholds = await Promise.all(
      assets.map((asset) =>
        readContract(wagmiConfig, {
          abi: BRIDGE_ABI,
          address: config?.collateral_bridge_contract.address as `0x${string}`,
          functionName: 'get_withdraw_threshold',
          args: [toAssetData(asset)?.contractAddress],
        })
      )
    ).then((thresholds) =>
      assets.reduce<Record<string, BigNumber | undefined>>(
        (all, asset, index) =>
          Object.assign(all, { [asset.id]: thresholds[index] }),
        {}
      )
    );

    return { delay, thresholds };
  }, [assets, config]);

  useEffect(() => {
    checkWithdraws().then((retrieved) => {
      if (!retrieved || !incompleteWithdrawals) {
        return;
      }
      const { thresholds, delay } = retrieved;
      const timestamped = incompleteWithdrawals.map((w) => {
        let timestamp = undefined;
        const assetChainId =
          w.asset.source.__typename === 'ERC20'
            ? Number(w.asset.source.chainId)
            : undefined;
        const threshold = thresholds[w.asset.id];
        if (threshold && assetChainId && delay) {
          timestamp = 0;
          if (new BigNumber(w.amount).isGreaterThan(threshold)) {
            const created = w.createdTimestamp;
            timestamp = new Date(created).getTime() + Number(delay) * 1000;
          }
        }
        return {
          data: w,
          timestamp,
        };
      });

      const delayed = timestamped?.filter(
        (item) => item.timestamp != null && Date.now() < item.timestamp
      );

      const ready = timestamped?.filter(
        (item) => item.timestamp != null && Date.now() >= item.timestamp
      );

      setReady(ready);
      setDelayed(delayed);
    });
  }, [checkWithdraws, incompleteWithdrawals]);

  return { ready, delayed };
};
