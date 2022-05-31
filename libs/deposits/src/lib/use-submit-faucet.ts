import type { createTokenContract } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitFaucet = (
  contract: ReturnType<typeof createTokenContract> | null
) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
