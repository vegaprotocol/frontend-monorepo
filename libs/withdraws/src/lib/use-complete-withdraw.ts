import { gql, useApolloClient } from '@apollo/client';
import {
  useBridgeContract,
  useEthereumTransaction,
} from '@vegaprotocol/react-helpers';
import { useCallback } from 'react';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
} from './__generated__/Erc20Approval';

const ERC20_APPROVAL_QUERY = gql`
  query Erc20Approval($withdrawalId: ID!) {
    erc20WithdrawalApproval(withdrawalId: $withdrawalId) {
      assetSource
      amount
      nonce
      signatures
      targetAddress
      expiry
    }
  }
`;

export interface WithdrawTransactionArgs {
  assetSource: string;
  amount: string;
  nonce: string;
  signatures: string;
  targetAddress: string;
}

export const useCompleteWithdraw = () => {
  const client = useApolloClient();
  const contract = useBridgeContract();
  const { transaction, perform } =
    useEthereumTransaction<WithdrawTransactionArgs>((args) => {
      if (!contract) {
        return null;
      }
      return contract.withdraw(args);
    });

  const submit = useCallback(
    async (withdrawalId: string) => {
      try {
        const res = await client.query<Erc20Approval, Erc20ApprovalVariables>({
          query: ERC20_APPROVAL_QUERY,
          variables: { withdrawalId },
        });

        if (!res.data.erc20WithdrawalApproval) {
          throw new Error('Could not retrieve withdrawal approval');
        }

        perform(res.data.erc20WithdrawalApproval);
      } catch (err) {
        console.log(err);
      }
    },
    [client, perform]
  );

  return { transaction, submit };
};
