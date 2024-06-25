import {
  type AssetERC20,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import { useEvmTx } from './use-evm-tx';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useChainId, useSwitchChain } from 'wagmi';
import { BRIDGE_ABI, prepend0x } from '@vegaprotocol/smart-contracts';
import { removeDecimal } from '@vegaprotocol/utils';

export const useEvmDeposit = ({ queryKey }: { queryKey: QueryKey }) => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { writeContract, data } = useEvmTx();

  const submitDeposit = async ({
    asset,
    bridgeAddress,
    amount,
    toPubKey,
    requiredConfirmations,
  }: {
    asset: AssetFieldsFragment;
    bridgeAddress: `0x${string}`;
    amount: string;
    toPubKey: string;
    requiredConfirmations: number;
  }) => {
    if (asset.source.__typename !== 'ERC20') {
      throw new Error('invalid asset');
    }

    // Make sure we are on the right chain. Changing asset will trigger a chain
    // change but its possible to end up on the wrong chain for the selected
    // asset if the user refreshes the page
    if (Number(asset.source.chainId) !== chainId) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    const assetAddress = asset.source.contractAddress as `0x${string}`;

    if (!bridgeAddress) {
      throw new Error(`no bridge found for asset ${asset.id}`);
    }

    await writeContract(
      {
        abi: BRIDGE_ABI,
        address: bridgeAddress,
        functionName: 'deposit_asset',
        args: [
          assetAddress,
          removeDecimal(amount, asset.decimals),
          prepend0x(toPubKey),
        ],
        chainId: Number(asset.source.chainId),
      },
      {
        functionName: 'deposit_asset',
        asset: asset as AssetERC20,
        amount,
        requiredConfirmations,
      }
    );

    queryClient.invalidateQueries({ queryKey });
  };

  return {
    submitDeposit,
    data,
  };
};
