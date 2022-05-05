import { useEthereumReadContract } from '@vegaprotocol/web3';
import type { ERC20Token } from '@vegaprotocol/smart-contracts-sdk';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';

export const useGetBalanceOfERC20Token = (contract: ERC20Token | null) => {
  const { account } = useWeb3React();
  console.log(account);

  const getBalance = useCallback(() => {
    if (!contract || !account) {
      return;
    }

    return contract.balanceOf(account);
  }, [contract, account]);

  const { state, refetch } = useEthereumReadContract(getBalance);

  return { balanceOf: state.data, refetch };
};
