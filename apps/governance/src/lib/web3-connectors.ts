import { ethers } from 'ethers';
export const createDefaultProvider = (providerUrl: string, chainId: number) => {
  return new ethers.providers.JsonRpcProvider(providerUrl, chainId);
};
