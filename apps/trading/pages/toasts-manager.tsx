import { ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useProposalToasts } from '@vegaprotocol/proposals';
import { useVegaTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumWithdrawApprovalsToasts } from '@vegaprotocol/web3';
import { useReadyToWithdrawalToasts } from '@vegaprotocol/withdraws';
import { Links } from '../lib/links';
import { useReferralToasts } from '../client-pages/referrals/hooks/use-referral-toasts';
import { useWalletDisconnectedToasts } from '../lib/hooks/use-wallet-disconnected-toasts';

export const ToastsManager = () => {
  useProposalToasts();
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();
  useReadyToWithdrawalToasts({
    withdrawalsLink: Links.PORTFOLIO(),
  });
  useReferralToasts();
  useWalletDisconnectedToasts();

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
