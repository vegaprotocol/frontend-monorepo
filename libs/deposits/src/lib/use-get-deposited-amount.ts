import { useCallback } from 'react';
import { ethers } from 'ethers';
import type { Asset } from './deposit-manager';
import { useEthereumConfig } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import { useWeb3React } from '@web3-react/core';

export const useGetDepositedAmount = (asset: Asset | undefined) => {
  const { account, provider } = useWeb3React();
  const { config } = useEthereumConfig();

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
  }, [provider, asset, config, account]);

  return getDepositedAmount;
};
