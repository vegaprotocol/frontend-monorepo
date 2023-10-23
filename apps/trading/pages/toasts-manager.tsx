import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useProposalNotificationToasts } from '@vegaprotocol/proposals';
import { useVegaTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumWithdrawApprovalsToasts } from '@vegaprotocol/web3';
import { useReadyToWithdrawalToasts } from '@vegaprotocol/withdraws';
import { Links } from '../lib/links';

export const ToastsManager = () => {
  useProposalNotificationToasts();
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();
  useReadyToWithdrawalToasts({
    withdrawalsLink: Links.PORTFOLIO(),
  });

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
