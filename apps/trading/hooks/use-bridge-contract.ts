import { VegaErc20Bridge } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

let contract: VegaErc20Bridge | null = null;
let consumers: Array<Dispatch<SetStateAction<VegaErc20Bridge | null>>> = [];

export const useBridgeContract = () => {
  const { provider } = useWeb3React();
  const [, newConsumer] = useState<VegaErc20Bridge | null>(null);

  useEffect(() => {
    consumers.push(newConsumer);

    return () => {
      consumers = consumers.filter((c) => c !== newConsumer);
    };
  }, []);

  useEffect(() => {
    if (!provider) {
      contract = null;
    } else {
      contract = new VegaErc20Bridge(
        // @ts-ignore TODO get from env
        'TESTNET',
        provider,
        provider?.getSigner()
      );
    }

    consumers.forEach((consumer) => {
      consumer(contract);
    });
  }, [provider]);

  return contract;
};
