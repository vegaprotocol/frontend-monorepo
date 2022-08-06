import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useState } from 'react';
import { useWithdrawalApproval } from './use-withdrawal-approval';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';

export interface WithdrawalFields {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useWithdraw = () => {
  const waitForWithdrawalApproval = useWithdrawalApproval();
  const [approval, setApproval] =
    useState<Erc20Approval_erc20WithdrawalApproval | null>(null);

  const { keypair } = useVegaWallet();
  const { transaction, send, setComplete, reset } = useVegaTransaction();

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
  };
};
