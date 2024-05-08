import { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { type ethers } from 'ethers';
import { useMemo } from 'react';

export const useTokenContract = (address?: string) => {
  const { provider } = useWeb3React();

  const contract = useMemo(() => {
    if (!address || !provider) return null;
    const signer = provider?.getSigner();
    return getTokenContract(address, signer || provider);
  }, [address, provider]);

  return contract;
};

export const getTokenContract = (
  address: string,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  return new Token(address, signerOrProvider);
};
