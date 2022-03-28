import { DepositPage_assets } from '@vegaprotocol/graphql';
import { useEthereumTransaction } from './use-ethereum-transaction';
import { useTokenContract } from './use-token-contract';

export const useApprove = (
  bridgeAddress: string,
  asset?: DepositPage_assets
) => {
  const contract = useTokenContract(asset);
  const { perform, status, error, confirmations, txHash } =
    useEthereumTransaction(() => {
      if (!contract) {
        return null;
      }
      return contract.approve(bridgeAddress);
    });

  return {
    perform,
    status,
    error,
    confirmations,
    txHash,
  };
};
