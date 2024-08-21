import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { useEvmTx } from './use-evm-tx';
import { useChainId, useSwitchChain } from 'wagmi';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';

type Approval = {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
  creation: string;
};

export const useEvmWithdraw = () => {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const { writeContract, data } = useEvmTx();

  const submitWithdraw = async ({
    bridgeAddress,
    approval,
    asset,
  }: {
    bridgeAddress: `0x${string}`;
    approval: Approval;
    asset: AssetFieldsFragment;
  }) => {
    if (asset.source.__typename !== 'ERC20') {
      throw new Error('invalid asset');
    }

    if (asset.source.chainId !== chainId.toString()) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    await writeContract({
      abi: BRIDGE_ABI,
      address: bridgeAddress,
      functionName: 'withdrawAsset',
      args: [
        approval.assetSource,
        approval.amount,
        approval.targetAddress,
        approval.creation,
        approval.nonce,
        approval.signatures,
      ],
      chainId: Number(asset.source.chainId),
    });
  };

  return {
    submitWithdraw,
    data,
  };
};
