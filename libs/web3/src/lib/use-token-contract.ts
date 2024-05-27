import { Token } from '@vegaprotocol/smart-contracts';
import { type ethers } from 'ethers';
import { useMemo } from 'react';
import { useProvider } from './use-bridge-contract';

type AssetData = {
  contractAddress: string;
  chainId: number;
};

export const useTokenContract = (
  assetData?: AssetData,
  allowDefaultProvider: boolean = false
) => {
  const { provider, error: providerError } = useProvider(
    assetData?.chainId,
    allowDefaultProvider
  );

  const signer = useMemo(() => {
    return provider ? provider?.getSigner() : undefined;
  }, [provider]);

  const contract = useMemo(() => {
    if (assetData && provider) {
      return getTokenContract(assetData.contractAddress, signer || provider);
    }
    return undefined;
  }, [assetData, provider, signer]);

  return {
    contract,
    chainId: assetData?.chainId,
    address: assetData?.contractAddress,
    error: providerError,
  };
};

export const getTokenContract = (
  address: string,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  return new Token(address, signerOrProvider);
};
