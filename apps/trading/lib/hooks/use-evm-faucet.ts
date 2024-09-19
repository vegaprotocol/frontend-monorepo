import uniqueId from 'lodash/uniqueId';
import { useSimulateContract } from 'wagmi';

import { type AssetERC20 } from '@vegaprotocol/assets';
import { ERC20_ABI } from '@vegaprotocol/smart-contracts';

import { useEvmTxStore, type TxFaucet } from './use-evm-tx';
import { useRef } from 'react';

export const useEvmFaucet = ({ asset }: { asset: AssetERC20 }) => {
  const idRef = useRef<string>(uniqueId());
  const faucet = useEvmTxStore((store) => store.faucet);
  const transaction = useEvmTxStore((store) => {
    return store.txs.get(idRef.current);
  });

  const contractParamters = {
    abi: ERC20_ABI,
    address: asset.source.contractAddress as `0x${string}`,
    functionName: 'faucet',
    chainId: Number(asset.source.chainId),
  };
  // Check to see if the faucet is available on the token
  const { data: contractRequestData } = useSimulateContract(contractParamters);

  const write = () => {
    return faucet(idRef.current, {
      asset,
      chainId: Number(asset.source.chainId),
    });
  };

  return {
    write: contractRequestData ? write : undefined,
    data: transaction as TxFaucet,
  };
};
