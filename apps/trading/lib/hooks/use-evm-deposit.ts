import uniqueId from 'lodash/uniqueId';
import { useEvmTxStore, type TxDeposit } from './use-evm-tx';
import { useRef } from 'react';

export const useEvmDeposit = () => {
  const idRef = useRef<string>(uniqueId());
  const deposit = useEvmTxStore((store) => store.deposit);
  const transaction = useEvmTxStore((store) => {
    return store.txs.get(idRef.current);
  });

  return {
    write: (config: Parameters<typeof deposit>[1]) => {
      return deposit(idRef.current, config);
    },
    data: transaction as TxDeposit,
  };
};
