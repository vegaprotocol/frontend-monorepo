import { gql, useQuery } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useState } from 'react';
import type {
  Erc20ApprovalPoll,
  Erc20ApprovalPollVariables,
  Erc20ApprovalPoll_erc20WithdrawalApproval,
} from './__generated__/Erc20ApprovalPoll';

const ERC20_WITHDRAWAL_QUERY = gql`
  query Erc20ApprovalPoll($withdrawalId: ID!) {
    erc20WithdrawalApproval(withdrawalId: $withdrawalId) {
      signatures
      amount
    }
  }
`;

export interface WithdrawalFields {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useCreateWithdraw = () => {
  const { keypair } = useVegaWallet();
  const { send, transaction, reset } = useVegaTransaction();
  const [id, setId] = useState<string | null>(null);
  const [approval, setApproval] =
    useState<Erc20ApprovalPoll_erc20WithdrawalApproval | null>(null);

  const { data, stopPolling } = useQuery<
    Erc20ApprovalPoll,
    Erc20ApprovalPollVariables
  >(ERC20_WITHDRAWAL_QUERY, {
    variables: { withdrawalId: id || '' },
    skip: !id,
    pollInterval: 1000,
  });

  useEffect(() => {
    if (data?.erc20WithdrawalApproval) {
      stopPolling();
      setApproval(data.erc20WithdrawalApproval);
    }
  }, [data, stopPolling]);

  const submit = useCallback(
    async (withdrawal: WithdrawalFields) => {
      if (!keypair) {
        return;
      }

      const res = await send({
        pubKey: keypair.pub,
        propagate: true,
        withdrawSubmission: {
          amount: withdrawal.amount,
          asset: withdrawal.asset,
          ext: {
            erc20: {
              receiverAddress: withdrawal.receiverAddress,
            },
          },
        },
      });

      if (res?.signature) {
        setId(determineId(res.signature));
      }
    },
    [keypair, send]
  );

  return {
    submit,
    approval,
    transaction,
    reset,
  };
};
