import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useState } from 'react';
import { useWithdrawalApproval } from './use-withdrawal-approval';
import { useWithdrawalEvent } from './use-withdrawal-event';
import type { Erc20ApprovalQuery } from './__generated__/Erc20Approval';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';

export interface WithdrawalArgs {
  amount: string;
  asset: string;
  receiverAddress: string;
  availableTimestamp: number | null;
}

export const useCreateWithdraw = () => {
  const waitForWithdrawalApproval = useWithdrawalApproval();
  const waitForWithdrawal = useWithdrawalEvent();
  const [approval, setApproval] = useState<
    Erc20ApprovalQuery['erc20WithdrawalApproval'] | null
  >(null);
  const [withdrawal, setWithdrawal] = useState<WithdrawalFieldsFragment | null>(
    null
  );
  const [availableTimestamp, setAvailableTimestamp] = useState<number | null>(
    null
  );

  const { keypair } = useVegaWallet();
  const { transaction, send, setComplete, reset, Dialog } =
    useVegaTransaction();

  const submit = useCallback(
    async (withdrawal: WithdrawalArgs) => {
      if (!keypair) {
        return;
      }

      setAvailableTimestamp(withdrawal.availableTimestamp);

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

        const withdrawal = await waitForWithdrawal(id, keypair.pub);
        setWithdrawal(withdrawal);
        const approval = await waitForWithdrawalApproval(withdrawal.id);
        setApproval(approval);
        setComplete();
      }
    },
    [keypair, send, waitForWithdrawal, waitForWithdrawalApproval, setComplete]
  );

  return {
    transaction,
    submit,
    reset,
    approval,
    withdrawal,
    availableTimestamp,
    Dialog,
  };
};
