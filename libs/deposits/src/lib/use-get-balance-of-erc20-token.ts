import { useEthereumReadContract } from '@vegaprotocol/web3';
import type { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

export const useGetBalanceOfERC20Token = (
  contract: Token | null,
  decimals: number | undefined
) => {
  const { account } = useWeb3React();

  const getBalance = useCallback(() => {
    if (!contract || !account) {
      return;
    }

    return contract.balanceOf(account);
  }, [contract, account]);

  const { state, refetch } = useEthereumReadContract(getBalance);

  const balance =
    state.data && decimals
      ? new BigNumber(addDecimal(state.data?.toString(), decimals))
      : undefined;

  return { balance, refetch };
};
