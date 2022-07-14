import { useQuery } from '@apollo/client';
import { determineId } from '@vegaprotocol/react-helpers';
import { useBridgeContract, useEthereumTransaction } from '@vegaprotocol/web3';
import { useVegaTransaction, useVegaWallet } from '@vegaprotocol/wallet';
import { useCallback, useEffect, useState } from 'react';
import { ERC20_APPROVAL_QUERY, ERC20_APPROVAL_QUERY_NEW } from './queries';
import type {
  NewWithdrawTransactionArgs,
  WithdrawTransactionArgs,
} from './use-complete-withdraw';
import type {
  Erc20Approval,
  Erc20ApprovalVariables,
  Erc20Approval_erc20WithdrawalApproval,
} from './__generated__/Erc20Approval';
import type {
  CollateralBridge,
  CollateralBridgeNew,
} from '@vegaprotocol/smart-contracts';
import type { Erc20ApprovalNew } from './__generated__/Erc20ApprovalNew';

export interface WithdrawalFields {
  amount: string;
  asset: string;
  receiverAddress: string;
}

export const useWithdraw = (cancelled: boolean, isNewContract: boolean) => {
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [approval, setApproval] =
    useState<Erc20Approval_erc20WithdrawalApproval | null>(null);

  const contract = useBridgeContract(isNewContract);
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
    if (contract.isNewContract) {
      const withdrawalArguments = args as NewWithdrawTransactionArgs;
      return (contract as CollateralBridgeNew).withdrawAsset(
        withdrawalArguments.assetSource,
        withdrawalArguments.amount,
        withdrawalArguments.targetAddress,
        withdrawalArguments.creation,
        withdrawalArguments.nonce,
        withdrawalArguments.signatures
      );
    } else {
      return (contract as CollateralBridge).withdrawAsset(
        args.assetSource,
        args.amount,
        args.targetAddress,
        args.nonce,
        args.signatures
      );
    }
  });

  const { data, stopPolling } = useQuery<
    Erc20Approval | Erc20ApprovalNew,
    Erc20ApprovalVariables
  >(isNewContract ? ERC20_APPROVAL_QUERY_NEW : ERC20_APPROVAL_QUERY, {
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
    withdrawalId,
    vegaTx,
    ethTx,
  };
};
