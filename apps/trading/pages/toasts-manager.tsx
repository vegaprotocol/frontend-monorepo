import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useUpdateNetworkParametersToasts } from '@vegaprotocol/proposals';
import { useVegaTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumWithdrawApprovalsToasts } from '@vegaprotocol/web3';
import { Routes } from './client-router';
import { useReadyToWithdrawalToasts } from '@vegaprotocol/withdraws';

export const ToastsManager = () => {
  useUpdateNetworkParametersToasts();
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();
  useReadyToWithdrawalToasts({
    withdrawalsLink: `${Routes.PORTFOLIO}`,
  });

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
