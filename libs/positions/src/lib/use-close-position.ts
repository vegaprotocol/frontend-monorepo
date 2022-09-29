import { useCallback } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { determineId } from '@vegaprotocol/react-helpers';
import { useVegaTransaction } from '@vegaprotocol/wallet';
import * as Sentry from '@sentry/react';
import { usePositionEvent } from '../';
import type { Position } from '../';

export const useClosePosition = () => {
  const { keypair } = useVegaWallet();

  const {
    send,
    transaction,
    reset: resetTransaction,
    setComplete,
    Dialog,
  } = useVegaTransaction();
  const waitForPositionEvent = usePositionEvent(transaction);

  const reset = useCallback(() => {
    resetTransaction();
  }, [resetTransaction]);

  const submit = useCallback(
    async (position: Position) => {
      if (!keypair || position.openVolume === '0') {
        return;
      }

      try {
        const res = await send({
          pubKey: keypair.pub,
          propagate: true,
          orderCancellation: {
            marketId: position.marketId,
            orderId: '',
          },
        });

        if (res?.signature) {
          const resId = determineId(res.signature);
          if (resId) {
            waitForPositionEvent(resId, keypair.pub, () => {
              setComplete();
            });
          }
        }
        return res;
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    },
    [keypair, send, setComplete, waitForPositionEvent]
  );

  return {
    transaction,
    Dialog,
    submit,
    reset,
  };
};
