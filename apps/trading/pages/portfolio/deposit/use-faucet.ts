import { useEthereumTransaction } from '../../../hooks/use-ethereum-transaction';
import { useTokenContract } from '../../../hooks/use-token-contract';

export const useFaucet = (assetContractAddress?: string) => {
  const contract = useTokenContract(assetContractAddress);
  const transaction = useEthereumTransaction(() => {
    if (!contract) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
