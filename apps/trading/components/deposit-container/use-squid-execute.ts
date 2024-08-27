import { useMutation } from '@tanstack/react-query';
import { useSquid } from './use-squid';
import { useEthersSigner } from './use-ethers-signer';
import { type RouteResponse } from '@0xsquid/sdk/dist/types';
import { type ethers } from 'ethers';
import { useState } from 'react';

export const useSquidExecute = () => {
  const signer = useEthersSigner();
  const { data: squid } = useSquid();
  const [hash, setHash] = useState<string>();

  const { mutate, ...mutation } = useMutation({
    mutationKey: ['squidExecute'],
    mutationFn: async (routeData: RouteResponse | null | undefined) => {
      if (!signer) return null;
      if (!squid) return null;
      if (!routeData) return null;

      const tx = (await squid.executeRoute({
        signer,
        route: routeData.route,
      })) as unknown as ethers.providers.TransactionResponse;
      setHash(tx.hash);

      const receipt = await tx.wait();
      return receipt;
    },
  });

  return {
    ...mutation,
    submitSquidDeposit: (routeData: RouteResponse | null | undefined) =>
      mutate(routeData),
    hash,
  };
};
