import BigNumber from 'bignumber.js';

import { useAccount, useReadContracts, useStorageAt } from 'wagmi';

import { encodeAbiParameters, erc20Abi, keccak256 } from 'viem';
import { type AssetERC20 } from '@vegaprotocol/assets';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { type EVMBridgeConfig, type EthereumConfig } from '@vegaprotocol/web3';

export const useAssetReadContracts = ({
  asset,
  configs,
}: {
  asset?: AssetERC20;
  configs: Array<EthereumConfig | EVMBridgeConfig>;
}) => {
  const { address } = useAccount();

  const assetAddress = asset?.source.contractAddress as `0x${string}`;
  const assetChainId = asset?.source.chainId;

  const config = configs.find((c) => c.chain_id === assetChainId);

  const bridgeAddress = config?.collateral_bridge_contract
    .address as `0x${string}`;

  const enabled = Boolean(assetAddress && bridgeAddress && address);

  const slot =
    address && assetAddress
      ? depositedAmountStorageLocation(address, assetAddress)
      : undefined;

  const { data: depositedData } = useStorageAt({
    address: bridgeAddress as `0x${string}`,
    slot,
    query: { enabled },
  });

  const { data, ...queryResult } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'balanceOf',
        args: address && [address],
        chainId: Number(assetChainId),
      },
      {
        abi: erc20Abi,
        address: assetAddress,
        functionName: 'allowance',
        args: address ? [address, bridgeAddress] : undefined,
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'get_asset_deposit_lifetime_limit',
        args: [assetAddress],
        chainId: Number(assetChainId),
      },
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'is_exempt_depositor',
        args: [address],
        chainId: Number(assetChainId),
      },
    ],
    query: {
      enabled,
    },
  });

  return {
    ...queryResult,
    data: data
      ? {
          balanceOf: data[0].result ? data[0].result.toString() : '0',
          allowance: data[1].result ? data[1].result?.toString() : '0',
          lifetimeLimit: data[2].result ? data[2].result?.toString() : '0',
          isExempt: data[3].result ? data[3].result?.toString() : '0',
          deposited: depositedData
            ? new BigNumber(depositedData, 16).toString()
            : '0',
        }
      : undefined,
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
