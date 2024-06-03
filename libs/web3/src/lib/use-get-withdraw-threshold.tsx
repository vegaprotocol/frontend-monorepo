import { useCallback } from 'react';
import { useGetCollateralBridge } from './use-bridge-contract';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { type AssetData } from './types';

/**
 * The withdraw threshold is a value set on the contract bridge per asset which
 * may be changed via a proposal therefore it can be cached for a set amount of
 * time (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

type TimestampedThreshold = {
  address: string;
  chainId: number;
  value: BigNumber;
  ts: number;
};
const THRESHOLDS: TimestampedThreshold[] = [];
const getCachedThreshold = (asset: AssetData) => {
  return THRESHOLDS.find(
    (th) => th.address === asset.contractAddress && th.chainId === asset.chainId
  );
};
const setCachedThreshold = (asset: AssetData, value: BigNumber) => {
  const thresholdData: TimestampedThreshold = {
    address: asset.contractAddress,
    chainId: asset.chainId,
    value: value,
    ts: Date.now(),
  };

  const index = THRESHOLDS.findIndex(
    (th) => th.address === asset.contractAddress && th.chainId === asset.chainId
  );
  if (index >= 0) {
    THRESHOLDS[index] = thresholdData;
  } else {
    THRESHOLDS.push(thresholdData);
  }
};

/**
 * Returns a function to get the threshold amount for a withdrawal.
 * If a withdrawal amount is greater than this value it will incur a delay
 * before being able to be completed. The delay is set on the smart contract and
 * can be retrieved using contract.default_withdraw_delay
 */
export const useGetWithdrawThreshold = () => {
  const logger = localLoggerFactory({ application: 'web3' });

  const getCollateralBridge = useGetCollateralBridge();

  const getThreshold = useCallback(
    async (asset: AssetData | undefined) => {
      if (!asset) return undefined;
      const contract = getCollateralBridge(asset.chainId);
      if (!contract) return undefined;

      // return cached value if still valid
      const thr = getCachedThreshold(asset);
      if (thr && Date.now() - thr.ts <= MAX_AGE) {
        return thr.value;
      }

      try {
        const res = await contract.get_withdraw_threshold(
          asset.contractAddress
        );

        const value = new BigNumber(addDecimal(res.toString(), asset.decimals));
        const threshold = value.isEqualTo(0)
          ? new BigNumber(Infinity)
          : value.minus(new BigNumber(addDecimal('1', asset.decimals)));
        logger.info(
          `retrieved withdraw threshold for ${
            asset.contractAddress
          }: ${threshold.toString()}`
        );
        setCachedThreshold(asset, threshold);
        return threshold;
      } catch (err) {
        logger.error('could not get the withdraw thresholds', err);
        return undefined;
      }
    },
    [getCollateralBridge, logger]
  );

  return getThreshold;
};
