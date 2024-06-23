import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useChainId, useSwitchChain } from 'wagmi';

import { type AssetFieldsFragment } from '@vegaprotocol/assets';

import { useEvmTx } from './use-evm-tx';
import { getErc20Abi } from '../utils/get-erc20-abi';

export const useEvmApprove = ({ queryKey }: { queryKey: QueryKey }) => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { writeContract, data } = useEvmTx();

  const submitApprove = async ({
    asset,
    bridgeAddress,
  }: {
    asset: AssetFieldsFragment;
    bridgeAddress: string;
  }) => {
    if (asset.source.__typename !== 'ERC20') {
      throw new Error('invalid asset');
    }

    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    const maxUint256 =
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const address = asset.source.contractAddress as `0x${string}`;

    await writeContract({
      abi: getErc20Abi({ address }),
      address,
      functionName: 'approve',
      args: [bridgeAddress, maxUint256],
      chainId: Number(asset.source.chainId),
    });

    queryClient.invalidateQueries({ queryKey });
  };

  return {
    submitApprove,
    data,
  };
};
