import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useState } from 'react';
import { useWithdrawalApproval } from './use-withdrawal-approval';
import { useWithdrawalEvent } from './use-withdrawal-event';
import type { Erc20Approval_erc20WithdrawalApproval } from './__generated__/Erc20Approval';
import type { WithdrawalFields } from './__generated__/WithdrawalFields';

export interface WithdrawalArgs {
  amount: string;
  asset: string;
  receiverAddress: string;
  availableTimestamp: number | null;
}

export const useCreateWithdraw = () => {
  const waitForWithdrawalApproval = useWithdrawalApproval();
  const [approval, setApproval] =
    useState<Erc20Approval_erc20WithdrawalApproval | null>(null);
  const [withdrawal, setWithdrawal] = useState<WithdrawalFields | null>(null);
  const [availableTimestamp, setAvailableTimestamp] = useState<number | null>(
    null
  );

  const { pubKey } = useVegaWallet();
  const { transaction, send, setComplete, reset, Dialog } =
    useVegaTransaction();

  const waitForWithdrawal = useWithdrawalEvent(transaction);

  const submit = useCallback(
    async (withdrawal: WithdrawalArgs) => {
      if (!pubKey) {
        return;
      }

      setAvailableTimestamp(withdrawal.availableTimestamp);

      const res = await send(pubKey, {
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

      if (res) {
        const withdrawalId = determineId(res.signature);

        const withdrawal = await waitForWithdrawal(withdrawalId, pubKey);
        setWithdrawal(withdrawal);
        const approval = await waitForWithdrawalApproval(withdrawal.id);
        setApproval(approval);
        setComplete();
      }
    },
    [pubKey, send, waitForWithdrawal, waitForWithdrawalApproval, setComplete]
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
