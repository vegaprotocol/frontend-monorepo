import {
  type AssetData,
  getTokenContract,
  useCollateralBridgeConfigs,
} from '@vegaprotocol/web3';
import { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { localLoggerFactory } from '@vegaprotocol/logger';
import { useWeb3React } from '@web3-react/core';
import { CollateralBridge } from '@vegaprotocol/smart-contracts';
import { ethers } from 'ethers';
import { toBigNum } from '@vegaprotocol/utils';

export interface DepositBalances {
  balance: BigNumber; // amount in Ethereum wallet
  allowance: BigNumber; // amount approved
  deposited: BigNumber; // total amounted deposited over lifetime
  max: BigNumber; // life time deposit cap
  exempt: boolean; // if exempt then deposit cap doesn't matter
}

/**
 * Hook which fetches all the balances required for depositing
 * whenever the asset changes in the form
 */

export const useBalances = (asset?: AssetData) => {
  const getBalances = useGetBalances();

  const [balances, setBalances] = useState<
    DepositBalances | 'loading' | undefined
  >(undefined);

  useEffect(() => {
    let ignore = false;

    const get = async () => {
      setBalances(undefined);
      const balances = await getBalances(asset);

      if (ignore) return;

      setBalances(balances);
    };

    get();

    return () => {
      ignore = true;
    };
  }, [asset, getBalances]);

  return {
    balances,
    resetBalances: () => setBalances(undefined),
    refetchBalances: async () => {
      setBalances(undefined);
      const balances = await getBalances(asset);
      setBalances(balances);
    },
  };
};

const logger = localLoggerFactory({ application: 'deposits' });

export const useGetBalances = () => {
  const { account, provider, chainId: activeChainId } = useWeb3React();
  const { configs } = useCollateralBridgeConfigs();

  const getData = useCallback(
    async (assetData?: AssetData) => {
      if (!assetData) {
        return;
      }

      if (!provider || !account) {
        logger.warn(
          `unable to get balances of ${assetData.symbol} (not connected)`
        );
        return;
      }

      const signer = provider.getSigner();

      if (activeChainId !== assetData.chainId) {
        logger.warn(
          `unable to get balances of ${assetData.symbol} (chain: ${assetData.chainId}) (wrong chain: ${activeChainId})`
        );
        return;
      }

      const config = configs.find((c) => c.chainId === assetData.chainId);
      if (!config) return;

      const collateralBridgeContract = new CollateralBridge(
        config.address,
        signer || provider
      );
      const tokenContract = getTokenContract(
        assetData.contractAddress,
        signer || provider
      );

      try {
        const allowanceResponse = await tokenContract.allowance(
          account,
          config.address
        );
        const allowance = toBigNum(
          allowanceResponse.toString(),
          assetData.decimals
        );

        const balanceResponse = await tokenContract.balanceOf(account);
        const balance = toBigNum(
          balanceResponse.toString(),
          assetData.decimals
        );

        const lifetimeLimitResponse =
          await collateralBridgeContract.get_asset_deposit_lifetime_limit(
            assetData.contractAddress
          );
        let lifetimeLimit = toBigNum(
          lifetimeLimitResponse.toString(),
          assetData.decimals
        );
        if (lifetimeLimit.isZero()) lifetimeLimit = new BigNumber(Infinity);

        const isExemptDepositor =
          await collateralBridgeContract.is_exempt_depositor(account);

        const depositedResponse = await provider.getStorageAt(
          config.address,
          depositedAmountStorageLocation(account, assetData.contractAddress)
        );
        const deposited = toBigNum(
          new BigNumber(depositedResponse, 16),
          assetData.decimals
        );

        const data: DepositBalances = {
          balance: balance,
          allowance: allowance,
          deposited: deposited,
          max: lifetimeLimit,
          exempt: isExemptDepositor,
        };

        return data;
      } catch (err) {
        // NOOP
        logger.error(
          `unable to get balances of ${assetData.symbol} (contract error)`,
          err
        );
        return;
      }
    },
    [account, activeChainId, configs, provider]
  );

  return getData;
};

const depositedAmountStorageLocation = (
  account: string,
  assetSource: string
) => {
  const abiCoder = new ethers.utils.AbiCoder();
  const innerHash = ethers.utils.keccak256(
    abiCoder.encode(['address', 'uint256'], [account, 4])
  );
  const storageLocation = ethers.utils.keccak256(
    abiCoder.encode(['address', 'bytes32'], [assetSource, innerHash])
  );
  return storageLocation;
};
