import uniqueId from 'lodash/uniqueId';
import { useEvmTxStore, type TxDeposit } from './use-evm-tx';
import { useRef } from 'react';

export const useEvmDeposit = () => {
  const idRef = useRef<string>();
  const deposit = useEvmTxStore((store) => store.deposit);
  const txs = useEvmTxStore((store) => store.txs);
  const data = idRef.current ? txs.get(idRef.current) : undefined;

  return {
    write: (config: Parameters<typeof deposit>[1]) => {
      idRef.current = uniqueId();
      return deposit(idRef.current, config);
    },
    data: data as TxDeposit,
  };
};
