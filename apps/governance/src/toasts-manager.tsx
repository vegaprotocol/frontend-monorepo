import {
  Intent,
  ToastsContainer,
  TradingButton,
  VegaIcon,
  VegaIconNames,
  useToasts,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWalletDialogStore } from '@vegaprotocol/wallet';
import {
  useEthereumTransactionToasts,
  useEthereumWithdrawApprovalsToasts,
  useVegaTransactionToasts,
  useWalletDisconnectToastActions,
  useWalletDisconnectedToasts,
} from '@vegaprotocol/web3';
import { useTranslation } from 'react-i18next';

const WalletDisconnectAdditionalContent = () => {
  const { t } = useTranslation();
  const { hideToast } = useWalletDisconnectToastActions();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  return (
    <p className="mt-2">
      <TradingButton
        data-testid="connect-vega-wallet"
        onClick={() => {
          hideToast();
          openVegaWalletDialog();
        }}
        size="small"
        intent={Intent.Danger}
        icon={<VegaIcon name={VegaIconNames.ARROW_RIGHT} size={14} />}
      >
        <span className="whitespace-nowrap uppercase">{t('Connect')}</span>
      </TradingButton>
    </p>
  );
};

export const ToastsManager = () => {
  useVegaTransactionToasts();
  useEthereumTransactionToasts();
  useEthereumWithdrawApprovalsToasts();
  useWalletDisconnectedToasts(<WalletDisconnectAdditionalContent />);

  const toasts = useToasts((store) => store.toasts);
  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
