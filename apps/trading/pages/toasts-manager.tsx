import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useProposalToasts } from '@vegaprotocol/proposals';
import { useVegaTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumWithdrawApprovalsToasts } from '@vegaprotocol/web3';
import { useReadyToWithdrawalToasts } from '@vegaprotocol/withdraws';
import { Links } from '../lib/links';

export const ToastsManager = () => {
  useProposalToasts();
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
