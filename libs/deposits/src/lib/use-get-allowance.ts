import type { Token } from '@vegaprotocol/smart-contracts';
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { localLoggerFactory } from '@vegaprotocol/logger';

export const useGetAllowance = (
  tokenContract: Token | null,
  collateralBridgeAddress?: string,
  account?: string
) => {
  const getAllowance = useCallback(async () => {
    if (!tokenContract || !account || !collateralBridgeAddress) {
      return;
    }

    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get allowance', {
        account,
        contractAddress: collateralBridgeAddress,
      });
      const res = await tokenContract.allowance(
        account,
        collateralBridgeAddress
      );
      return new BigNumber(res.toString());
    } catch (err) {
      logger.error('get allowance', err);
      return;
    }
  }, [account, collateralBridgeAddress, tokenContract]);

  return getAllowance;
};
