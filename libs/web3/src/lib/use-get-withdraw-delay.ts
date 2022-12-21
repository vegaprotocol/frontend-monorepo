import * as Sentry from '@sentry/react';
import { useBridgeContract } from './use-bridge-contract';
import { useCallback } from 'react';

/**
 * Gets the delay in seconds thats required if the withdrawal amount is
 * over the withdrawal threshold (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const contract = useBridgeContract();
  const getDelay = useCallback(async () => {
    try {
      const res = await contract?.default_withdraw_delay();
      return res.toNumber();
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [contract]);

  return getDelay;
};
