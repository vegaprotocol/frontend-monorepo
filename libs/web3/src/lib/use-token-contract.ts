import { Token } from '@vegaprotocol/smart-contracts';
import { type ethers } from 'ethers';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { type AssetData } from './types';
import { ERR_WRONG_CHAIN } from './constants';

export const useTokenContract = (
  assetData?: Pick<AssetData, 'chainId' | 'contractAddress'>
) => {
  const { provider, chainId: activeChainId } = useWeb3React();

  const signer = useMemo(() => {
    return provider ? provider?.getSigner() : undefined;
  }, [provider]);

  const contract = useMemo(() => {
    if (!assetData || !provider || assetData.chainId !== activeChainId) {
      return;
    }
    return getTokenContract(assetData.contractAddress, signer || provider);
  }, [activeChainId, assetData, provider, signer]);

  return {
    contract,
    chainId: assetData?.chainId,
    address: assetData?.contractAddress,
    error:
      assetData && assetData.chainId !== activeChainId
        ? ERR_WRONG_CHAIN
        : undefined,
  };
};

export const getTokenContract = (
  address: string,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  return new Token(address, signerOrProvider);
};
