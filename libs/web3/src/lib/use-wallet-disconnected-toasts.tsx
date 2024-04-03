import {
  Intent,
  useToasts,
  ToastHeading,
  CLOSE_AFTER,
  type Toast,
} from '@vegaprotocol/ui-toolkit';
import { useConnector } from '@vegaprotocol/wallet-react';
import { useEffect, useMemo } from 'react';
import { useT } from './use-t';

export const WALLET_DISCONNECTED_TOAST_ID = 'WALLET_DISCONNECTED_TOAST_ID';

export const useWalletDisconnectToastActions = () => {
  const [hasToast, updateToast] = useToasts((state) => [
    state.hasToast,
    state.update,
  ]);
  const hideToast = () => {
    if (!hasToast(WALLET_DISCONNECTED_TOAST_ID)) return;
    updateToast(WALLET_DISCONNECTED_TOAST_ID, {
      hidden: true,
    });
  };
  const showToast = () => {
    if (!hasToast(WALLET_DISCONNECTED_TOAST_ID)) return;
    updateToast(WALLET_DISCONNECTED_TOAST_ID, {
      hidden: false,
    });
  };
  return { showToast, hideToast };
};

export const useWalletDisconnectedToasts = (
  additionalContent?: JSX.Element
) => {
  const t = useT();
  const [hasToast, setToast] = useToasts((state) => [
    state.hasToast,
    state.setToast,
    state.update,
  ]);
  const { connector } = useConnector();
  const { showToast, hideToast } = useWalletDisconnectToastActions();

  const toast: Toast = useMemo(
    () => ({
      id: WALLET_DISCONNECTED_TOAST_ID,
      intent: Intent.Danger,
      content: (
        <>
          <ToastHeading>{t('Wallet connection lost')}</ToastHeading>
          <p>{t('The connection to the Vega wallet has been lost.')}</p>
          {additionalContent}
        </>
      ),
      onClose: () => {
        hideToast();
      },
      closeAfter: CLOSE_AFTER,
    }),
    [additionalContent, hideToast, t]
  );

  useEffect(() => {
    if (!connector) return;

    function handleDisconnect() {
      if (hasToast(WALLET_DISCONNECTED_TOAST_ID)) {
        showToast();
      } else {
        setToast(toast);
      }
    }

    connector.on('client.disconnected', handleDisconnect);

    return () => {
      connector.off('client.disconnected', handleDisconnect);
    };
  }, [connector, hasToast, setToast, showToast, t, toast]);
};
