import { useBridgeContract } from './use-bridge-contract';
import { useCallback } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';

/**
 * The withdraw delay is a global value set on the contract bridge which may be
 * changed via a proposal therefore it can be cached for a set amount of time
 * (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

type TimestampedDelay = { value: number | undefined; ts: number };
const DELAY: TimestampedDelay = { value: undefined, ts: 0 };

/**
 * Returns a function that gets the delay in seconds that's required if the
 * withdrawal amount is over the withdrawal threshold
 * (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const contract = useBridgeContract(true);
  const logger = localLoggerFactory({ application: 'web3' });

  const getDelay = useCallback(async () => {
    if (DELAY.value != null && Date.now() - DELAY.ts <= MAX_AGE) {
      return DELAY.value;
    }
    if (!contract) {
      logger.info('could not get withdraw delay: no bridge contract');
      return undefined;
    }
    try {
      const res = await contract?.default_withdraw_delay();
      logger.info(`retrieved withdraw delay: ${res} seconds`);
      DELAY.value = res.toNumber();
      DELAY.ts = Date.now();
      return res.toNumber() as number;
    } catch (err) {
      logger.error('could not get withdraw delay', err);
      return undefined;
    }
  }, [contract, logger]);

  return getDelay;
};
