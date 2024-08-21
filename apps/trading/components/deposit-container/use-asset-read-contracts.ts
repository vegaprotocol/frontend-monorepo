import BigNumber from 'bignumber.js';

import { useAccount, useReadContracts, useStorageAt } from 'wagmi';

import { encodeAbiParameters, keccak256 } from 'viem';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';

import { getErc20Abi } from '../../lib/utils/get-erc20-abi';
import { isAssetNative, toBigNum } from '@vegaprotocol/utils';

export const useAssetReadContracts = ({
  token,
  configs,
}: {
  token?: {
    address: string;
    chainId: string;
    decimals: number;
  };
  configs: Array<EthereumConfig | EVMBridgeConfig>;
}) => {
  const { address } = useAccount();

  const assetAddress = token?.address as `0x${string}`;
  const assetChainId = Number(token?.chainId);

  const config = configs.find((c) => Number(c.chain_id) === assetChainId);

  const bridgeAddress = config?.collateral_bridge_contract
    .address as `0x${string}`;

  const enabled = Boolean(
    assetAddress && !isAssetNative(assetAddress) && address
  );

  const slot =
    address && assetAddress
      ? depositedAmountStorageLocation(address, assetAddress)
      : undefined;

  const { data: depositedData } = useStorageAt({
    address: bridgeAddress as `0x${string}`,
    slot,
    query: { enabled },
  });

  const tokenAbi = getErc20Abi({ address: assetAddress });

  const queryResult = useReadContracts({
    contracts: [
      {
        abi: tokenAbi,
        address: assetAddress,
        functionName: 'balanceOf',
        args: address && [address],
        chainId: Number(assetChainId),
      },
      {
        abi: tokenAbi,
        address: assetAddress,
        functionName: 'allowance',
        args: address && bridgeAddress ? [address, bridgeAddress] : undefined,
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_asset_deposit_lifetime_limit',
        args: [assetAddress],
        chainId: Number(assetChainId),
      },
    ],
    query: {
      enabled,
    },
  });

  if (!token || !queryResult.data) {
    return {
      ...queryResult,
      data: undefined,
    };
  }

  const data = queryResult.data;

  return {
    ...queryResult,
    data: {
      balanceOf: toBigNum(data[0].result?.toString() || '0', token.decimals),
      allowance: toBigNum(data[1].result?.toString() || '0', token.decimals),
      lifetimeLimit: toBigNum(
        data[2].result?.toString() || '0',
        token.decimals
      ),
      deposited: depositedData
        ? toBigNum(new BigNumber(depositedData, 16).toString(), token.decimals)
        : BigNumber('0'),
    },
  };
};

const depositedAmountStorageLocation = (
  account: `0x${string}`,
  assetSource: `0x${string}`
) => {
  const innerHash = keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [account, BigInt(4)]
    )
  );

  const storageLocation = keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'bytes32' }],
      [assetSource, innerHash]
    )
  );

  return storageLocation;
};
