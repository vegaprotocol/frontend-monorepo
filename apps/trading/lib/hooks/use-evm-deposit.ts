import uniqueId from 'lodash/uniqueId';
import { useEvmTxStore, type TxDeposit } from '../../stores/evm';
import { useRef } from 'react';

export const useEvmDeposit = () => {
  const idRef = useRef<string>(uniqueId());
  const deposit = useEvmTxStore((store) => store.deposit);
  const reset = useEvmTxStore((store) => store.resetTx);
  const txs = useEvmTxStore((store) => store.txs);
  const data = idRef.current ? txs.get(idRef.current) : undefined;

  return {
    write: (config: Parameters<typeof deposit>[1]) => {
      return deposit(idRef.current, config);
    },
    reset: () => {
      reset(idRef.current);
    },
    data: data as TxDeposit,
  };
};
