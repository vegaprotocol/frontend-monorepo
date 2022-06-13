import type { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useEthereumConfig, useEthereumReadContract } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';

export const useGetAllowance = (contract: Token | null, decimals?: number) => {
  const { account } = useWeb3React();
  const { config } = useEthereumConfig();

  const getAllowance = useCallback(() => {
    if (!contract || !account || !config) {
      return;
    }
    return contract.allowance(
      account,
      config.collateral_bridge_contract.address
    );
  }, [contract, account, config]);

  const {
    state: { data },
  } = useEthereumReadContract(getAllowance);

  if (!data || !decimals) return;

  const allowance = new BigNumber(addDecimal(data.toString(), decimals));

  return allowance;
};
