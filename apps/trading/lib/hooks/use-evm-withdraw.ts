import uniqueId from 'lodash/uniqueId';
import { useRef } from 'react';
import { useEvmTxStore, type TxWithdraw } from '../../stores/evm';

export const useEvmWithdraw = () => {
  const idRef = useRef(uniqueId());
  const withdraw = useEvmTxStore((store) => store.withdraw);
  const reset = useEvmTxStore((store) => store.resetTx);
  const txs = useEvmTxStore((store) => store.txs);
  const data = idRef.current ? txs.get(idRef.current) : undefined;

  return {
    write: (config: Parameters<typeof withdraw>[1]) => {
      return withdraw(idRef.current, config);
    },
    reset: () => {
      reset(idRef.current);
    },
    data: data as TxWithdraw,
  };
};
