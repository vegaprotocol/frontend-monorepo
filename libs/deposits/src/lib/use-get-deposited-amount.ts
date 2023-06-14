import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useEthereumConfig } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/assets';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useWeb3React } from '@web3-react/core';

export const useGetDepositedAmount = (asset: Asset | undefined) => {
  const { account, provider } = useWeb3React();
  const { config } = useEthereumConfig();

  // For an explaination of how this code works see here: https://gist.github.com/emilbayes/44a36f59b06b1f3edb9cf914041544ed
  const getDepositedAmount = useCallback(async () => {
    if (
      !provider ||
      !config ||
      !account ||
      !asset ||
      asset.source.__typename !== 'ERC20'
    ) {
      return;
    }
    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get deposited amount', { asset: asset.id });
      const abicoder = new ethers.utils.AbiCoder();
      const innerHash = ethers.utils.keccak256(
        abicoder.encode(['address', 'uint256'], [account, 4])
      );
      const storageLocation = ethers.utils.keccak256(
        abicoder.encode(
          ['address', 'bytes32'],
          [asset.source.contractAddress, innerHash]
        )
      );
      const res = await provider.getStorageAt(
        config.collateral_bridge_contract.address,
        storageLocation
      );
      const value = new BigNumber(res, 16).toString();
      return new BigNumber(addDecimal(value, asset.decimals));
    } catch (err) {
      logger.error('get deposited amount', err);
      return;
    }
  }, [provider, asset, config, account]);

  return getDepositedAmount;
};
