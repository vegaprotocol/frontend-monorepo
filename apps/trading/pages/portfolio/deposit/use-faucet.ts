import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';

export const useFaucet = (contract: ERC20Token | null) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
