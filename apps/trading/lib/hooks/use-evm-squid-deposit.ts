import uniqueId from 'lodash/uniqueId';
import { useEvmTxStore, type TxSquidDeposit } from '../../stores/evm';
import { useRef } from 'react';

export const useEvmSquidDeposit = () => {
  const idRef = useRef<string>(uniqueId());
  const squidDeposit = useEvmTxStore((store) => store.squidDeposit);
  const reset = useEvmTxStore((store) => store.resetTx);
  const txs = useEvmTxStore((store) => store.txs);
  const data = idRef.current ? txs.get(idRef.current) : undefined;

  return {
    write: (config: Parameters<typeof squidDeposit>[1]) => {
      return squidDeposit(idRef.current, config);
    },
    reset: () => {
      reset(idRef.current);
    },
    data: data as TxSquidDeposit,
  };
};
