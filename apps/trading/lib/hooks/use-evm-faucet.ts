import { useChainId, useSwitchChain } from 'wagmi';

import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { ERC20_ABI } from '@vegaprotocol/smart-contracts';
import { useEvmTx } from './use-evm-tx';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';

export const useEvmFaucet = ({ queryKey }: { queryKey: QueryKey }) => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { writeContract, data } = useEvmTx();

  const submitFaucet = async ({ asset }: { asset: AssetFieldsFragment }) => {
    if (asset.source.__typename !== 'ERC20') {
      throw new Error('invalid asset');
    }

    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    await writeContract({
      abi: ERC20_ABI, // has the faucet method
      address: asset.source.contractAddress as `0x${string}`,
      functionName: 'faucet',
      chainId: Number(asset.source.chainId),
    });

    queryClient.invalidateQueries({ queryKey });
  };

  return {
    submitFaucet,
    data,
  };
};
