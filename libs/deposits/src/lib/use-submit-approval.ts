import { removeDecimal } from '@vegaprotocol/react-helpers';
import * as Sentry from '@sentry/react';
import type { Token } from '@vegaprotocol/smart-contracts';
import {
  useEthereumConfig,
  useEthereumTransaction,
  useTokenContract,
} from '@vegaprotocol/web3';
import { useDepositStore } from './deposit-store';
import { useGetAllowance } from './use-get-allowance';

export const useSubmitApproval = () => {
  const { config } = useEthereumConfig();
  const { asset, update } = useDepositStore();
  const contract = useTokenContract(
    asset?.source.__typename === 'ERC20'
      ? asset.source.contractAddress
      : undefined,
    true
  );
  const getAllowance = useGetAllowance(contract, asset);
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
        const allowance = await getAllowance();
        update({ allowance });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
  };
};
