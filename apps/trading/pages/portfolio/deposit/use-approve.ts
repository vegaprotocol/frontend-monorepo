import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';

export const useApprove = (
  contract: ERC20Token | null,
  bridgeAddress: string
) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.approve(bridgeAddress);
  });

  return transaction;
};
