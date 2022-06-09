import { Token } from '@vegaprotocol/smart-contracts';
import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitFaucet = (contract: Token | TokenFaucetable | null) => {
  const transaction = useEthereumTransaction(() => {
    if (!contract || contract instanceof Token) {
      return null;
    }
    return contract.faucet();
  });

  return transaction;
};
