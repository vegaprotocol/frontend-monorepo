import uniqueId from 'lodash/uniqueId';
import { useRef } from 'react';
import { useEvmTxStore, type TxWithdraw } from './use-evm-tx';

export const useEvmWithdraw = () => {
  const idRef = useRef<string>();
  const withdraw = useEvmTxStore((store) => store.withdraw);
  const txs = useEvmTxStore((store) => store.txs);
  const data = idRef.current ? txs.get(idRef.current) : undefined;

  return {
    write: (config: Parameters<typeof withdraw>[1]) => {
      idRef.current = uniqueId();
      return withdraw(idRef.current, config);
    },
    data: data as TxWithdraw,
  };
};
