import { useAccount, useReadContracts } from 'wagmi';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';

import { type AssetERC20, useEnabledAssets } from '@vegaprotocol/assets';
import { toBigNum } from '@vegaprotocol/utils';

import { getErc20Abi } from '../utils/get-erc20-abi';

/**
 * Returns all assets with the balance on the foreign chain
 * Assets with zero or no balance are removed
 */
export const useAssetsWithBalance = () => {
  const { address, isConnected } = useAccount();

  const queryResult = useEnabledAssets();

  const assets = (queryResult.data || []).filter((a) => {
    return a.source.__typename === 'ERC20';
  }) as AssetERC20[];

  // Create an array of balanceOf contract calls so we can get the users
  // balanace for every erc20 on the vega network
  const contracts = assets.map((asset) => {
    const assetAddress = asset.source.contractAddress as `0x${string}`;

    return {
      abi: getErc20Abi({ address: assetAddress }),
      address: assetAddress,
      functionName: 'balanceOf',
      args: address && [address],
      chainId: Number(asset.source.chainId),
    };
  });

  const { data: balanceData, queryKey } = useReadContracts({
    contracts: compact(contracts),
    query: {
      enabled: isConnected,
    },
  });

  // Add the foreign wallet balance to our array of assets
  const withBalance = assets
    .map((a, i) => {
      let balance = '';

      if (balanceData && balanceData[i].result) {
        balance = (balanceData[i].result as bigint).toString();
      }

      return { ...a, balance };
    })
    .filter((a) => {
      if (a.balance === '') return false;
      if (a.balance === '0') return false;
      return true;
    });

  return {
    ...queryResult,
    queryKey, // key for invalidating balances
    data: orderBy(
      withBalance,
      (a) => toBigNum(a.balance || '0', a.decimals).toNumber(),
      'desc'
    ),
  };
};
