import uniqueId from 'lodash/uniqueId';
import { useRef } from 'react';
import { useEvmTxStore, type TxWithdraw } from './use-evm-tx';

export const useEvmWithdraw = () => {
  const idRef = useRef<string>(uniqueId());
  const withdraw = useEvmTxStore((store) => store.withdraw);
  const transaction = useEvmTxStore((store) => {
    return store.txs.get(idRef.current);
  });

  return {
    write: (config: Parameters<typeof withdraw>[1]) => {
      return withdraw(idRef.current, config);
    },
    data: transaction as TxWithdraw,
  };
};
