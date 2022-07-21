import type { Token, TokenFaucetable } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitFaucet = (contract: Token | TokenFaucetable | null) => {
  const transaction = useEthereumTransaction<TokenFaucetable>(
    contract,
    'faucet'
  );
  return transaction;
};
