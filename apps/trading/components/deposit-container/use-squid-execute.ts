import { useMutation } from '@tanstack/react-query';
import { useSquid } from './use-squid';
import { useEthersSigner } from './use-ethers-signer';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { type ethers } from 'ethers';
import { useState } from 'react';

export const useSquidExecute = () => {
  const signer = useEthersSigner();
  const { data: squid } = useSquid();

  const [transaction, setTransaction] =
    useState<ethers.providers.TransactionResponse>();
  const [receipt, setReceipt] = useState<ethers.providers.TransactionReceipt>();

  const mutation = useMutation({
    mutationKey: ['squidExecute'],
    mutationFn: async (routeData: RouteResponse | null | undefined) => {
      if (!signer) {
        throw new Error('no singer');
      }

      if (!squid) {
        throw new Error('squid not initialized');
      }

      if (!routeData) {
        throw new Error('no route');
      }

      const tx = (await squid.executeRoute({
        signer,
        route: routeData.route,
      })) as unknown as ethers.providers.TransactionResponse;
      setTransaction(tx);

      const receipt = await tx.wait();
      setReceipt(receipt);
      return receipt;
    },
  });

  return {
    ...mutation,
    reset: () => {
      setTransaction(undefined);
      setReceipt(undefined);
      mutation.reset();
    },
    transaction,
    receipt,
  };
};
