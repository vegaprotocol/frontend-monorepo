import { useQuery } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useState } from 'react';
import { ERC20_APPROVAL_QUERY_NEW } from './queries';
import type { Erc20ApprovalVariables } from './__generated__/Erc20Approval';
import type {
  Erc20ApprovalNew,
  Erc20ApprovalNew_erc20WithdrawalApproval,
} from './__generated__/Erc20ApprovalNew';
import type { CollateralBridgeNew } from '@vegaprotocol/smart-contracts';

export interface WithdrawalFields {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useWithdraw = (cancelled: boolean) => {
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [approval, setApproval] =
    useState<Erc20ApprovalNew_erc20WithdrawalApproval | null>(null);

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
  } = useEthereumTransaction<CollateralBridgeNew, 'withdraw_asset'>(
    contract,
    'withdraw_asset'
  );

  const { data, stopPolling } = useQuery<
    Erc20ApprovalNew,
    Erc20ApprovalVariables
  >(ERC20_APPROVAL_QUERY_NEW, {
    variables: { withdrawalId: withdrawalId || '' },
    skip: !withdrawalId,
    pollInterval: 1000,
  });

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
        setWithdrawalId(determineId(res.signature));
      }
    },
    [keypair, send]
  );

  useEffect(() => {
    if (
      data?.erc20WithdrawalApproval &&
      data.erc20WithdrawalApproval.signatures.length > 2
    ) {
      stopPolling();
      setApproval(data.erc20WithdrawalApproval);
    }
  }, [data, stopPolling]);

  useEffect(() => {
    if (approval && contract && !cancelled) {
      perform(
        approval.assetSource,
        approval.amount,
        approval.targetAddress,
        approval.creation,
        approval.nonce,
        approval.signatures
      );
    }
    // eslint-disable-next-line
  }, [approval, contract]);

  const reset = useCallback(() => {
    resetVegaTx();
    resetEthTx();
  }, [resetVegaTx, resetEthTx]);

  return {
    submit,
    reset,
    approval,
    withdrawalId,
    vegaTx,
    ethTx,
  };
};
