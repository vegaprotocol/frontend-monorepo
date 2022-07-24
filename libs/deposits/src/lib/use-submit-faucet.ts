import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import { useEthereumTransaction, useTokenContract } from '@vegaprotocol/web3';
import { useDepositStore } from './deposit-store';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';

export const useSubmitFaucet = () => {
  const { asset, update } = useDepositStore();
  const contract = useTokenContract(
    asset?.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined,
    true
  );
  const getBalance = useGetBalanceOfERC20Token(contract, asset);
  const transaction = useEthereumTransaction<TokenFaucetable, 'faucet'>(
    contract,
    'faucet'
  );
  return {
    ...transaction,
    perform: async () => {
      await transaction.perform();
      const balance = await getBalance();
      update({ balance });
    },
  };
};
