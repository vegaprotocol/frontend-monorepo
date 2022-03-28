import { DepositPage_assets } from '@vegaprotocol/graphql';
import { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

let contract: ERC20Token | null = null;
let consumers: Array<Dispatch<SetStateAction<ERC20Token | null>>> = [];

export const useTokenContract = (
  asset?: DepositPage_assets
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
    if (!provider || !asset || asset.source.__typename !== 'ERC20') {
      contract = null;
    } else {
      contract = new ERC20Token(
        asset.source.contractAddress,
        provider,
        provider?.getSigner()
      );
    }

    consumers.forEach((consumer) => {
      consumer(contract);
    });
  }, [provider, asset]);

  return contract;
};
