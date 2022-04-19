import { useQuery } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useState } from 'react';
import { ERC20_APPROVAL_QUERY } from './queries';
import type { WithdrawTransactionArgs } from './use-complete-withdraw';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
  Erc20Approval_erc20WithdrawalApproval,
} from './__generated__/Erc20Approval';

export interface WithdrawalFields {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useWithdraw = (cancelled: boolean) => {
  const [id, setId] = useState<string | null>(null);
  const [approval, setApproval] =
    useState<Erc20Approval_erc20WithdrawalApproval | null>(null);

  const contract = useBridgeContract();
  const { keypair } = useVegaWallet();
  const {
    transaction: vegaTx,
    send,
    reset: resetVegaTx,
  } = useVegaTransaction();

  const {
    transaction: ethTx,
    perform,
    reset: resetEthTx,
  } = useEthereumTransaction<WithdrawTransactionArgs>((args) => {
    if (!contract) {
      return null;
    }
    return contract.withdraw(args);
  });

  const { data, stopPolling } = useQuery<Erc20Approval, Erc20ApprovalVariables>(
    ERC20_APPROVAL_QUERY,
    {
      variables: { withdrawalId: id || '' },
      skip: !id,
      pollInterval: 1000,
    }
  );

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

  useEffect(() => {
    if (data?.erc20WithdrawalApproval) {
      stopPolling();
      setApproval(data.erc20WithdrawalApproval);
    }
  }, [data, stopPolling]);

  useEffect(() => {
    if (approval && !cancelled) {
      perform(approval);
    }
    // eslint-disable-next-line
  }, [approval]);

  const reset = useCallback(() => {
    resetVegaTx();
    resetEthTx();
  }, [resetVegaTx, resetEthTx]);

  return {
    submit,
    reset,
    approval,
    vegaTx,
    ethTx,
  };
};
