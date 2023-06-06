import { useBridgeContract } from './use-bridge-contract';
import { useCallback } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';

/**
 * Gets the delay in seconds thats required if the withdrawal amount is
 * over the withdrawal threshold (contract.get_withdraw_threshold)
 */
export const useGetWithdrawDelay = () => {
  const contract = useBridgeContract();
  const getDelay = useCallback(async () => {
    const logger = localLoggerFactory({ application: 'web3' });
    try {
      logger.info('get withdraw delay', { contract: contract?.toString() });
      const res = await contract?.default_withdraw_delay();
      return res.toNumber();
    } catch (err) {
      logger.error('get withdraw delay', err);
    }
  }, [contract]);

  return getDelay;
};
