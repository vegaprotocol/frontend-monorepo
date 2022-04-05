import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useEthereumTransaction } from '@vegaprotocol/react-helpers';

export const useSubmitFaucet = (contract: ERC20Token | null) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
