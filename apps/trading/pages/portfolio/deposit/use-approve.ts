import type { DepositPage_assets } from './__generated__/DepositPage';
import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';
import { useTokenContract } from '../../../hooks/use-token-contract';

export const useApprove = (
  bridgeAddress: string,
  asset?: DepositPage_assets
) => {
  const contract = useTokenContract(asset);
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.approve(bridgeAddress);
  });

  return transaction;
};
