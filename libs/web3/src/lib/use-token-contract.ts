import { Token } from '@vegaprotocol/smart-contracts';
import { type ethers } from 'ethers';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { type AssetData } from './types';
import { ERR_WRONG_CHAIN } from './constants';
import { useDefaultWeb3Providers } from './default-web3-provider';

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

export const useTokenContractStatic = (
  assetData?: Pick<AssetData, 'chainId' | 'contractAddress'>
) => {
  const { providers } = useDefaultWeb3Providers();

  const contract = useMemo(() => {
    if (!assetData || !providers) {
      return;
    }

    const provider = providers[assetData.chainId];

    if (!provider) return;

    return getTokenContract(assetData.contractAddress, provider);
  }, [assetData, providers]);

  return {
    contract,
    chainId: assetData?.chainId,
    address: assetData?.contractAddress,
  };
};

export const getTokenContract = (
  address: string,
  signerOrProvider?: ethers.Signer | ethers.providers.Provider
) => {
  return new Token(address, signerOrProvider);
};
