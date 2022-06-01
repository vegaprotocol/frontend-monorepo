import type { Token } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitFaucet = (contract: Token | null) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
