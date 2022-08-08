import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import * as Sentry from '@sentry/react';
import { useEthereumTransaction, useTokenContract } from '@vegaprotocol/web3';
import { useDepositStore } from './deposit-store';
import { useGetBalanceOfERC20Token } from './use-get-balance-of-erc20-token';
import { isAssetTypeERC20 } from '@vegaprotocol/react-helpers';

export const useSubmitFaucet = () => {
  const { asset, update } = useDepositStore();
  const contract = useTokenContract(
    isAssetTypeERC20(asset) ? asset : undefined,
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
      try {
        await transaction.perform();
        const balance = await getBalance();
        update({ balance });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
  };
};
