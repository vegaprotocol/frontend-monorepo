import { Intent, ToastsContainer, useToasts } from '@vegaprotocol/ui-toolkit';
import { useProposalToasts } from '@vegaprotocol/proposals';
import { useReferralToasts } from '../client-pages/referrals/hooks/use-referral-toasts';
import {
  useWalletDisconnectToastActions,
  useWalletDisconnectedToasts,
} from '@vegaprotocol/web3';
import { VegaWalletConnectButton } from '../components/vega-wallet-connect-button';
import { usePositionCloseOutNotification } from '../lib/hooks/use-position-closeout-notification';

import { useVegaTransactionToasts } from '../lib/hooks/use-vega-transaction-toasts';
import { useReadyToWithdrawalToasts } from '../lib/hooks/use-ready-to-complete-withdrawals-toast';

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
  useReadyToWithdrawalToasts();
  useReferralToasts();
  useWalletDisconnectedToasts(<WalletDisconnectAdditionalContent />);
  usePositionCloseOutNotification();

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
