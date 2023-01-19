import { isAssetTypeERC20, removeDecimal } from '@vegaprotocol/react-helpers';
import * as Sentry from '@sentry/react';
import type { Token } from '@vegaprotocol/smart-contracts';
import {
  useEthereumConfig,
  useEthereumTransaction,
  useTokenContract,
} from '@vegaprotocol/web3';
import type { Asset } from '@vegaprotocol/assets';

export const useSubmitApproval = (asset?: Asset) => {
  const { config } = useEthereumConfig();
  const contract = useTokenContract(
    isAssetTypeERC20(asset) ? asset.source.contractAddress : undefined,
    true
  );
  const transaction = useEthereumTransaction<Token, 'approve'>(
    contract,
    'approve'
  );
  return {
    ...transaction,
    perform: async () => {
      if (!asset || !config) return;
      try {
        const amount = removeDecimal('1000000', asset.decimals);
        await transaction.perform(
          config.collateral_bridge_contract.address,
          amount
        );
      } catch (err) {
        Sentry.captureException(err);
      }
    },
  };
};
