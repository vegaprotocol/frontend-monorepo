import { useCallback } from 'react';
import { useBridgeContract } from './use-bridge-contract';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/utils';
import type { WithdrawalBusEventFieldsFragment } from '@vegaprotocol/wallet';
import { localLoggerFactory } from '@vegaprotocol/logger';

type Asset = Pick<
  WithdrawalBusEventFieldsFragment['asset'],
  'source' | 'decimals'
>;

/**
 * The withdraw threshold is a value set on the contract bridge per asset which
 * may be changed via a proposal therefore it can be cached for a set amount of
 * time (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const BUILTIN_ASSET_ADDRESS = 'builtin';
export const BUILTIN_ASSET_THRESHOLD = new BigNumber(Infinity);
type TimestampedThreshold = { value: BigNumber; ts: number };
const THRESHOLDS: Record<string, TimestampedThreshold> = {};
const setThreshold = (address: string, value: BigNumber) =>
  (THRESHOLDS[address] = { value, ts: Date.now() });

export const addr = (asset: Asset | undefined) =>
  asset && asset.source.__typename === 'ERC20'
    ? asset.source.contractAddress
    : BUILTIN_ASSET_ADDRESS;

/**
 * Returns a function to get the threshold amount for a withdrawal.
 * If a withdrawal amount is greater than this value it will incur a delay
 * before being able to be completed. The delay is set on the smart contract and
 * can be retrieved using contract.default_withdraw_delay
 */
export const useGetWithdrawThreshold = () => {
  const logger = localLoggerFactory({ application: 'web3' });
  const contract = useBridgeContract(true);

  const getThreshold = useCallback(
    async (asset: Asset | undefined) => {
      const contractAddress = addr(asset);
      // return cached value if still valid
      const thr = THRESHOLDS[contractAddress];
      if (thr && Date.now() - thr.ts <= MAX_AGE) {
        return thr.value;
      }
      if (!contract || !asset || contractAddress === BUILTIN_ASSET_ADDRESS) {
        setThreshold(BUILTIN_ASSET_ADDRESS, BUILTIN_ASSET_THRESHOLD);
        return BUILTIN_ASSET_THRESHOLD;
      }
      try {
        const res = await contract.get_withdraw_threshold(contractAddress);
        const value = new BigNumber(addDecimal(res.toString(), asset.decimals));
        const threshold = value.isEqualTo(0)
          ? new BigNumber(Infinity)
          : value.minus(new BigNumber(addDecimal('1', asset.decimals)));
        logger.info(
          `retrieved withdraw threshold for ${addr(
            asset
          )}: ${threshold.toString()}`
        );
        setThreshold(contractAddress, threshold);
        return threshold;
      } catch (err) {
        logger.error('could not get the withdraw thresholds', err);
        return undefined;
      }
    },
    [contract, logger]
  );

  return getThreshold;
};
