import {
  useBridgeContract,
  useEthereumTransaction,
} from '@vegaprotocol/react-helpers';

export interface WithdrawTransactionArgs {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
}

export const useCompleteWithdraw = () => {
  const contract = useBridgeContract();
  const transaction = useEthereumTransaction<WithdrawTransactionArgs>(
    (args) => {
      if (!contract) {
        return null;
      }
      return contract.withdraw(args);
    }
  );

  return transaction;
};
