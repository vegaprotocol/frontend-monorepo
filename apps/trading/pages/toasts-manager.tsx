import { Intent, ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useProposalToasts } from '@vegaprotocol/proposals';
import { useVegaTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumTransactionToasts } from '@vegaprotocol/web3';
import { useEthereumWithdrawApprovalsToasts } from '@vegaprotocol/web3';
import { useReadyToWithdrawalToasts } from '@vegaprotocol/withdraws';
import { Links } from '../lib/links';
import { useReferralToasts } from '../client-pages/referrals/hooks/use-referral-toasts';
import {
  useWalletDisconnectToastActions,
  useWalletDisconnectedToasts,
} from '@vegaprotocol/web3';
import { VegaWalletConnectButton } from '../components/vega-wallet-connect-button';

const WalletDisconnectAdditionalContent = () => {
  const { hideToast } = useWalletDisconnectToastActions();
  return (
    <p className="mt-2">
      <VegaWalletConnectButton
        intent={Intent.Danger}
        onClick={() => {
          // hide toast when clicked on `Connect`
          hideToast();
        }}
      />
    </p>
  );
};

export const ToastsManager = () => {
  useProposalToasts();
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();
  useReadyToWithdrawalToasts({
    withdrawalsLink: Links.PORTFOLIO(),
  });
  useReferralToasts();
  useWalletDisconnectedToasts(<WalletDisconnectAdditionalContent />);

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
