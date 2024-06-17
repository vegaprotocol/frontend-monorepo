import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  toAssetData,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
} from '@vegaprotocol/web3';
import {
  type WithdrawalFieldsFragment,
  withdrawalProvider,
} from '@vegaprotocol/withdraws';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import compact from 'lodash/compact';

export type TimestampedWithdrawals = {
  data: WithdrawalFieldsFragment;
  timestamp: number | undefined;
}[];

export const useIncompleteWithdrawals = () => {
  const [ready, setReady] = useState<TimestampedWithdrawals>([]);
  const [delayed, setDelayed] = useState<TimestampedWithdrawals>([]);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || isReadOnly,
  });
  const getDelay = useGetWithdrawDelay(); // seconds
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

  const getThreshold = useGetWithdrawThreshold();

  const checkWithdraws = useCallback(async () => {
    if (assets.length === 0) return;

    const chainIds = uniq(
      compact(
        assets.map((a) =>
          a.source.__typename === 'ERC20' ? Number(a.source.chainId) : null
        )
      )
    );

    const delays = await Promise.all(
      chainIds.map((chainId) => getDelay(chainId))
    ).then((delays) =>
      chainIds.reduce<Record<number, number | undefined>>(
        (all, chainId, index) =>
          Object.assign(all, { [chainId]: delays[index] }),
        {}
      )
    );

    const thresholds = await Promise.all(
      assets.map((asset) => getThreshold(toAssetData(asset)))
    ).then((thresholds) =>
      assets.reduce<Record<string, BigNumber | undefined>>(
        (all, asset, index) =>
          Object.assign(all, { [asset.id]: thresholds[index] }),
        {}
      )
    );

    return { delays, thresholds };
  }, [assets, getDelay, getThreshold]);

  useEffect(() => {
    checkWithdraws().then((retrieved) => {
      if (
        !retrieved ||
        Object.keys(retrieved.delays).length === 0 ||
        !incompleteWithdrawals
      ) {
        return;
      }
      const { thresholds, delays } = retrieved;
      const timestamped = incompleteWithdrawals.map((w) => {
        let timestamp = undefined;
        const assetChainId =
          w.asset.source.__typename === 'ERC20'
            ? Number(w.asset.source.chainId)
            : undefined;
        const threshold = thresholds[w.asset.id];
        if (threshold && assetChainId && delays[assetChainId] != null) {
          const delay = delays[assetChainId];
          timestamp = 0;
          if (new BigNumber(w.amount).isGreaterThan(threshold)) {
            const created = w.createdTimestamp;
            timestamp = new Date(created).getTime() + (delay as number) * 1000;
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
