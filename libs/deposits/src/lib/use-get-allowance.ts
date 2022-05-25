import type { ERC20Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useEthereumReadContract } from '@vegaprotocol/web3';

export const useGetAllowance = (
  contract: ERC20Token | null,
  bridgeAddress: string
) => {
  const { account } = useWeb3React();

  const getAllowance = useCallback(() => {
    if (!contract || !account) {
      return;
    }
    return contract.allowance(account, bridgeAddress);
  }, [contract, account, bridgeAddress]);

  const {
    state: { data },
  } = useEthereumReadContract(getAllowance);

  return data;
};
