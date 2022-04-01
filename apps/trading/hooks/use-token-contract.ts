import { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

let contract: ERC20Token | null = null;
let consumers: Array<Dispatch<SetStateAction<ERC20Token | null>>> = [];

export const useTokenContract = (
  contractAddress?: string
): ERC20Token | null => {
  const { provider } = useWeb3React();
  const [, newConsumer] = useState<ERC20Token | null>(null);

  useEffect(() => {
    consumers.push(newConsumer);

    return () => {
      consumers = consumers.filter((c) => c !== newConsumer);
    };
  }, []);

  useEffect(() => {
    if (!provider || !contractAddress) {
      contract = null;
    } else {
      contract = new ERC20Token(
        contractAddress,
        provider,
        provider?.getSigner()
      );
    }

    consumers.forEach((consumer) => {
      consumer(contract);
    });
  }, [provider, contractAddress]);

  return contract;
};
