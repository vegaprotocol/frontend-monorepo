import type { TokenFaucetable } from '@vegaprotocol/smart-contracts';
import * as Sentry from '@sentry/react';
import { useEthereumTransaction, useTokenContract } from '@vegaprotocol/web3';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import type { Asset } from '@vegaprotocol/assets';

export const useSubmitFaucet = (asset?: Asset) => {
  const contract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined,
    true
  );
  const transaction = useEthereumTransaction<TokenFaucetable, 'faucet'>(
    contract,
    'faucet'
  );
  return {
    ...transaction,
    perform: async () => {
      try {
        await transaction.perform();
      } catch (err) {
        Sentry.captureException(err);
      }
    },
  };
};
