import { useGetCollateralBridge } from './use-bridge-contract';
import { useCallback } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';

/**
 * The withdraw delay is a global value set on the contract bridge which may be
 * changed via a proposal therefore it can be cached for a set amount of time
 * (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

type TimestampedDelay = {
  chainId: number;
  value: number | undefined;
  ts: number;
};
type ChainId = number;

const DELAYS: Map<ChainId, TimestampedDelay> = new Map();

const getCachedDelay = (chainId?: number) => {
  if (!chainId) return;
  return DELAYS.get(chainId);
};
const setCachedDelay = (chainId: number, value: number) => {
  const delayData: TimestampedDelay = {
    chainId,
    value,
    ts: Date.now(),
  };
  DELAYS.set(chainId, delayData);
};

/**
 * Returns a function that gets the delay in seconds that's required if the
 * withdrawal amount is over the withdrawal threshold
 * (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const logger = localLoggerFactory({ application: 'web3' });

  const getCollateralBridge = useGetCollateralBridge();

  const getDelay = useCallback(
    async (chainId: number) => {
      const delay = getCachedDelay(chainId);

      if (delay && delay.value != null && Date.now() - delay.ts <= MAX_AGE) {
        return delay.value;
      }

      const contract = getCollateralBridge(chainId);
      if (!contract) {
        logger.info('could not get withdraw delay: no bridge contract');
        return undefined;
      }
      try {
        const res = await contract?.default_withdraw_delay();

        logger.info(`retrieved withdraw delay: ${res} seconds`);
        setCachedDelay(chainId, res.toNumber());
        return res.toNumber() as number;
      } catch (err) {
        logger.error('could not get withdraw delay', err);
        return undefined;
      }
    },
    [getCollateralBridge, logger]
  );

  return getDelay;
};
