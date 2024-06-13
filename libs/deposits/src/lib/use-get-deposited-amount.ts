import { useCallback } from 'react';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { localLoggerFactory } from '@vegaprotocol/logger';

export const useGetDepositedAmount = (
  /** The provider */
  provider?: ethers.providers.JsonRpcProvider,
  /** The asset contract address */
  assetSource?: string,
  /** The collateral bridge contract address */
  collateralBridgeContractAddress?: string,
  /** The account address */
  account?: string
) => {
  // For an explaination of how this code works see here: https://gist.github.com/emilbayes/44a36f59b06b1f3edb9cf914041544ed
  const getDepositedAmount = useCallback(async () => {
    if (
      !provider ||
      !account ||
      !assetSource ||
      !collateralBridgeContractAddress
    ) {
      return;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposited amount', { asset: assetSource });
      const abicoder = new ethers.utils.AbiCoder();
      const innerHash = ethers.utils.keccak256(
        abicoder.encode(['address', 'uint256'], [account, 4])
      );
      const storageLocation = ethers.utils.keccak256(
        abicoder.encode(['address', 'bytes32'], [assetSource, innerHash])
      );
      const res = await provider.getStorageAt(
        collateralBridgeContractAddress,
        storageLocation
      );
      const value = new BigNumber(res, 16).toString();
      return new BigNumber(value);
    } catch (err) {
      logger.error('get deposited amount', err);
      return;
    }
  }, [account, assetSource, collateralBridgeContractAddress, provider]);

  return getDepositedAmount;
};
