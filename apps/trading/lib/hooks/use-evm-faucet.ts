import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useChainId, useSimulateContract, useSwitchChain } from 'wagmi';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { ERC20_ABI } from '@vegaprotocol/smart-contracts';

import { useEvmTx } from './use-evm-tx';

export const useEvmFaucet = ({
  asset,
  queryKey,
}: {
  asset: AssetERC20;
  queryKey: QueryKey;
}) => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const contractParamters = {
    abi: ERC20_ABI,
    address: asset.source.contractAddress as `0x${string}`,
    functionName: 'faucet',
    chainId: Number(asset.source.chainId),
  };

  // Check to see if the faucet is available on the token
  const { data: contractRequestData } = useSimulateContract(contractParamters);

  const { writeContract, data } = useEvmTx();

  const submitFaucet = async () => {
    if (asset.source.__typename !== 'ERC20') {
      throw new Error('invalid asset');
    }

    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    await writeContract(contractParamters);

    queryClient.invalidateQueries({ queryKey });
  };

  return {
    submitFaucet: contractRequestData ? submitFaucet : undefined,
    data,
  };
};
