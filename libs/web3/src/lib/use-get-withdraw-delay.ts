import { useBridgeContract } from './use-bridge-contract';
import { useCallback } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useWithdrawDataStore } from './use-withdraw-data-store';

/**
 * The withdraw delay is a global value set on the contract bridge which may be
 * changed via a proposal therefore it can be cached for a set amount of time
 * (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Returns a function that gets the delay in seconds that's required if the
 * withdrawal amount is over the withdrawal threshold
 * (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const delay = useWithdrawDataStore((state) => state.delay);
  const setDelay = useWithdrawDataStore((state) => state.setDelay);
  const contract = useBridgeContract(true);
  const logger = localLoggerFactory({ application: 'web3' });

  const getDelay = useCallback(async () => {
    if (delay && Date.now() - delay.ts <= MAX_AGE) {
      return delay.value;
    }
    if (!contract) {
      logger.info('could not get withdraw delay: no bridge contract');
      return undefined;
    }
    try {
      const res = await contract?.default_withdraw_delay();
      logger.info(`retrieved withdraw delay: ${res} seconds`);
      setDelay(res.toNumber());
      return res.toNumber() as number;
    } catch (err) {
      logger.error('could not get withdraw delay', err);
      return undefined;
    }
  }, [contract, delay, logger, setDelay]);

  return getDelay;
};
