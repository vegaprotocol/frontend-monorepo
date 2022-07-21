import type { Token } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitApproval = (contract: Token | null) => {
  const transaction = useEthereumTransaction<Token>(contract, 'approve');
  return transaction;
};
