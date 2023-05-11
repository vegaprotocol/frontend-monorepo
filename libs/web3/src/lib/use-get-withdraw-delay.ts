import { useBridgeContract } from './use-bridge-contract';
import { useCallback } from 'react';
import { localLoggerFactory } from '@vegaprotocol/utils';

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
      const logger = localLoggerFactory({ application: 'web3' });
      if (err.message.match(/call revert exception/)) {
        logger.info('call revert eth exception', err);
      } else {
        logger.error(err);
      }
    }
  }, [contract]);

  return getDelay;
};
