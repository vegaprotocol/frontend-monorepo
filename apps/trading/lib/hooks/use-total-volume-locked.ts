import { useReadContracts } from 'wagmi';
import compact from 'lodash/compact';
import { erc20Abi } from 'viem';
import { useEnabledAssets } from '@vegaprotocol/assets';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import {
  useEnvironment,
  ASSET_POOL_ADDRESSES,
} from '@vegaprotocol/environment';

export const useTotalValueLocked = () => {
  const { VEGA_ENV } = useEnvironment();
  const { data } = useEnabledAssets();

  const assets = (data || []).filter(isAssetTypeERC20);

  const address = ASSET_POOL_ADDRESSES[VEGA_ENV];
  const contracts = assets.map((asset) => {
    if (asset.source.__typename !== 'ERC20') return;

    const config = {
      abi: erc20Abi,
      address: asset.source.contractAddress as `0x${string}`,
      functionName: 'balanceOf',
      args: [address],
      chainId: Number(asset.source.chainId),
    };

    return config;
  });

  const queryResult = useReadContracts({
    contracts: compact(contracts),
    query: {
      enabled: Boolean(contracts.length),
    },
  });

  const result = (queryResult.data || []).map((res, i) => {
    const asset = assets[i];
    const rawValue = res.result ? res.result.toString() : '0';
    const val = BigNumber(rawValue).div(asset.quantum);
    return val;
  });

  const tvl = BigNumber.sum.apply(null, result);

  return {
    ...queryResult,
    data: tvl,
  };
};
