import { Deposit_assets } from '@vegaprotocol/graphql';
import { useEthereumTransaction } from './use-ethereum-transaction';
import { useTokenContract } from './use-token-contract';

export const useApprove = (bridgeAddress: string, asset?: Deposit_assets) => {
  const contract = useTokenContract(asset);
  const { perform, status, error, confirmations, txHash } =
    useEthereumTransaction(() => contract.approve(bridgeAddress));

  return {
    perform,
    status,
    error,
    confirmations,
    txHash,
  };
};
