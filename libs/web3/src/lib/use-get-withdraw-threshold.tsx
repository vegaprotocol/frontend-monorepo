import { useCallback, useEffect } from 'react';
import { useBridgeContract } from './use-bridge-contract';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/utils';
import type { WithdrawalBusEventFieldsFragment } from '@vegaprotocol/wallet';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { create } from 'zustand';

type Asset = Pick<
  WithdrawalBusEventFieldsFragment['asset'],
  'source' | 'decimals'
>;

/**
 * Returns a function to get the threshold amount for a withdrawal.
 * If a withdrawal amount is greater than this value it will incur a delay
 * before being able to be completed. The delay is set on the smart contract and
 * can be retrieved using contract.default_withdraw_delay
 */
export const useGetWithdrawThreshold = () => {
  const contract = useBridgeContract(true);
  const getThreshold = useCallback(
    async (asset: Asset | undefined) => {
      if (!contract || asset?.source.__typename !== 'ERC20') {
        return new BigNumber(Infinity);
      }
      const res = await contract.get_withdraw_threshold(
        asset.source.contractAddress
      );
      const value = new BigNumber(addDecimal(res.toString(), asset.decimals));
      const threshold = value.isEqualTo(0)
        ? new BigNumber(Infinity)
        : value.minus(new BigNumber(addDecimal('1', asset.decimals)));
      return threshold;
    },
    [contract]
  );

  return getThreshold;
};

/**
 * The withdraw threshold is a value set on the contract bridge per asset which
 * may be changed via a proposal therefore it can be cached for a set amount of
 * time (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes
const BUILTIN_ASSET_ADDRESS = 'builtin';
const BUILTIN_ASSET_THRESHOLD = new BigNumber(Infinity);

type WithdrawThresholdsStore = {
  thresholds: Record<string, { value: BigNumber; ts: number }>;
  setThreshold: (contractAddress: string, threshold: BigNumber) => void;
};

const useWithdrawThresholdsStore = create<WithdrawThresholdsStore>()((set) => ({
  thresholds: {
    [BUILTIN_ASSET_ADDRESS]: { value: BUILTIN_ASSET_THRESHOLD, ts: 0 },
  },
  setThreshold: (contractAddress, threshold) =>
    set((state) => {
      state.thresholds[contractAddress] = { value: threshold, ts: Date.now() };
      return state;
    }),
}));

const addr = (asset: Asset) =>
  asset?.source.__typename === 'ERC20'
    ? asset.source.contractAddress
    : BUILTIN_ASSET_ADDRESS;

export const useWithdrawThresholds = (assets: Asset[] | undefined) => {
  const getThreshold = useGetWithdrawThreshold();
  const logger = localLoggerFactory({ application: 'web3' });
  const thresholds = useWithdrawThresholdsStore((state) => state.thresholds);
  const setThreshold = useWithdrawThresholdsStore(
    (state) => state.setThreshold
  );

  useEffect(() => {
    if (!assets || assets.length === 0) return;
    for (const asset of assets) {
      const threshold = thresholds[addr(asset)];
      if (threshold && Date.now() - threshold.ts <= MAX_AGE) {
        return;
      }
      getThreshold(asset)
        .then((t) => {
          logger.info(
            `retrieved withdraw threshold for ${addr(asset)}: ${t.toString()}`
          );
          setThreshold(addr(asset), t);
        })
        .catch((err) =>
          logger.error('could not get the withdraw threshold', err)
        );
    }
  }, [assets, getThreshold, logger, setThreshold, thresholds]);

  return thresholds;
};
