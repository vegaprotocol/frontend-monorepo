import { useBridgeContract } from './use-bridge-contract';
import { useCallback, useEffect } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { create } from 'zustand';

/**
 * Returns a function that gets the delay in seconds that's required if the
 * withdrawal amount is over the withdrawal threshold
 * (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const contract = useBridgeContract(true);
  const getDelay = useCallback(async () => {
    const logger = localLoggerFactory({ application: 'web3' });
    if (!contract) {
      logger.error('get withdraw delay: no bridge contract');
      return;
    }
    try {
      logger.info('get withdraw delay', { contract });
      const res = await contract?.default_withdraw_delay();
      return res.toNumber();
    } catch (err) {
      logger.error('get withdraw delay', err);
    }
  }, [contract]);

  return getDelay;
};

/**
 * The withdraw delay is a global value set on the contract bridge which may be
 * changed via a proposal therefore it can be cached for a set amount of time
 * (MAX_AGE) and re-retrieved when necessary.
 */

const MAX_AGE = 5 * 60 * 1000; // 5 minutes

type WithdrawDelayStore = {
  delay: number | null;
  ts: number;
  setDelay: (delay: number) => void;
};
const useWithdrawDelayStore = create<WithdrawDelayStore>()((set) => ({
  delay: null,
  ts: 0,
  setDelay: (delay) => set({ delay }),
}));

export const useWithdrawDelay = () => {
  const getDelay = useGetWithdrawDelay();
  const logger = localLoggerFactory({ application: 'web3' });
  const [delay, ts] = useWithdrawDelayStore((state) => [state.delay, state.ts]);
  const setDelay = useWithdrawDelayStore((state) => state.setDelay);

  useEffect(() => {
    if (delay && Date.now() - ts <= MAX_AGE) return;
    getDelay()
      .then((d) => {
        if (typeof d === 'number') {
          logger.info(`retrieved withdraw delay: ${d} seconds`);
          setDelay(d);
        }
      })
      .catch((err) => logger.error('could not get the withdraw delay', err));
  }, [delay, getDelay, logger, setDelay, ts]);

  return delay;
};
