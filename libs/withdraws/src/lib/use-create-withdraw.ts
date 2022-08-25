import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useState } from 'react';
import { useWithdrawalApproval } from './use-withdrawal-approval';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';

export interface WithdrawalArgs {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useCreateWithdraw = () => {
  const waitForWithdrawalApproval = useWithdrawalApproval();
  const [approval, setApproval] =
    useState<Erc20Approval_erc20WithdrawalApproval | null>(null);

  const { keypair } = useVegaWallet();
  const { transaction, send, setComplete, reset, Dialog } =
    useVegaTransaction();

  const submit = useCallback(
    async (withdrawal: WithdrawalArgs) => {
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
        const id = determineId(res.signature);
        waitForWithdrawalApproval(id, (approval) => {
          setApproval(approval);
          setComplete();
        });
      }
    },
    [keypair, send, waitForWithdrawalApproval, setComplete]
  );

  return {
    transaction,
    submit,
    reset,
    approval,
    Dialog,
  };
};
