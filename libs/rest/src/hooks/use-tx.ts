import { wsUrl } from '../env';
import type {
  googlerpcStatus,
  v2ObserveTransactionResultsResponse,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import {
  ConnectorError,
  ConnectorErrors,
  type Transaction,
} from '@vegaprotocol/wallet';
import { useEffect, useState } from 'react';
import { useConfig } from './use-config';
import { useWallet } from './use-wallet';

type UseTxOptions = {
  onSuccess?: (result: Result) => void;
  onError?: (errorMessage?: string) => void;
};

export enum TxStatus {
  Idle = 'Idle',
  Requested = 'Requested',
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Rejected = 'Rejected',
  Failed = 'Failed',
}

export enum Errors {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  REJECTED_BY_USER = 'REJECTED_BY_USER',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type Result = {
  txHash: string;
  signature: string;
};

export const useTx = (options?: UseTxOptions) => {
  const { sendTransaction } = useConfig();
  const [pubKey, walletStatus] = useWallet((store) => [
    store.pubKey,
    store.status,
  ]);

  const [status, setStatus] = useState<TxStatus>(TxStatus.Idle);
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();

  const reset = () => {
    setStatus(TxStatus.Idle);
    setResult(undefined);
    setError(undefined);
  };

  const send = async (tx: Transaction) => {
    if (!pubKey || walletStatus !== 'connected') {
      setError(Errors.WALLET_NOT_CONNECTED);
      options?.onError?.(Errors.WALLET_NOT_CONNECTED);
      return;
    }

    setStatus(TxStatus.Requested);
    setError(undefined);

    try {
      const result = await sendTransaction({
        publicKey: pubKey,
        transaction: tx,
        sendingMode: 'TYPE_SYNC' as const,
      });
      setStatus(TxStatus.Pending);
      setResult({
        txHash: result.transactionHash,
        signature: result.signature,
      });
    } catch (err) {
      setStatus(TxStatus.Rejected);
      if (
        err instanceof ConnectorError &&
        err.code === ConnectorErrors.userRejected.code
      ) {
        setError(Errors.REJECTED_BY_USER);
        options?.onError?.(Errors.REJECTED_BY_USER);
      } else if (err instanceof Error) {
        setError(err.message);
        options?.onError?.(err.message);
      } else {
        setError(Errors.UNKNOWN_ERROR);
        options?.onError?.(Errors.UNKNOWN_ERROR);
      }
    }
  };

  useObserveTransactionResult({
    onData: (data) => {
      if (!result) return;

      const thisTx = data.result?.transactionResults?.find(
        (r) =>
          r.hash?.toLocaleLowerCase() === result?.txHash.toLocaleLowerCase()
      );

      if (thisTx?.success && !thisTx?.failure?.error) {
        setStatus(TxStatus.Confirmed);
      } else {
        setStatus(TxStatus.Failed);
        setError(thisTx?.failure?.error);
      }
    },
  });

  return {
    result,
    error,
    status,
    send,
    reset,
  };
};

type EventData = {
  error?: googlerpcStatus;
  result?: v2ObserveTransactionResultsResponse;
};

type UseObserveTransactionResultOptions = {
  onData?: (data: EventData) => void;
};

export const useObserveTransactionResult = (
  options: UseObserveTransactionResultOptions
) => {
  const apiUrl = wsUrl();
  useEffect(() => {
    const ws = new WebSocket(`${apiUrl}/stream/transaction-results`);
    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data) as EventData;
          options.onData?.(data);
        } catch {
          // NOOP
        }
      }
    };
    return () => {
      ws.close();
    };
  }, [apiUrl, options]);
};
