import {
  Intent,
  useToasts,
  ToastHeading,
  CLOSE_AFTER,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useEffect, useMemo } from 'react';
import { useT } from '../use-t';
import { VegaWalletConnectButton } from '../../components/vega-wallet-connect-button';

const WALLET_DISCONNECTED_TOAST_ID = 'WALLET_DISCONNECTED_TOAST_ID';

export const useWalletDisconnectedToasts = () => {
  const t = useT();
  const [hasToast, setToast, updateToast] = useToasts((state) => [
    state.hasToast,
    state.setToast,
    state.update,
  ]);
  const { isAlive } = useVegaWallet();

  const toast = useMemo(
    () => ({
      id: WALLET_DISCONNECTED_TOAST_ID,
      intent: Intent.Danger,
      content: (
        <>
          <ToastHeading>{t('Wallet connection lost')}</ToastHeading>
          <p>{t('The connection to the Vega wallet has been lost.')}</p>
          <p className="mt-2">
            <VegaWalletConnectButton
              intent={Intent.Danger}
              onClick={() => {
                updateToast(WALLET_DISCONNECTED_TOAST_ID, {
                  hidden: true,
                });
              }}
            />
          </p>
        </>
      ),
      onClose: () => {
        updateToast(WALLET_DISCONNECTED_TOAST_ID, {
          hidden: true,
        });
      },
      closeAfter: CLOSE_AFTER,
    }),
    [t, updateToast]
  );

  useEffect(() => {
    if (isAlive === false) {
      if (hasToast(WALLET_DISCONNECTED_TOAST_ID)) {
        updateToast(WALLET_DISCONNECTED_TOAST_ID, { hidden: false });
      } else {
        setToast(toast);
      }
    }
  }, [hasToast, isAlive, setToast, t, toast, updateToast]);
};
