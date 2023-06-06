import type { Token } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useEthereumConfig } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import type { Asset } from '@vegaprotocol/assets';
import { addDecimal } from '@vegaprotocol/utils';
import { localLoggerFactory } from '@vegaprotocol/logger';

export const useGetAllowance = (
  contract: Token | null,
  asset: Asset | undefined
) => {
  const { account } = useWeb3React();
  const { config } = useEthereumConfig();

  const getAllowance = useCallback(async () => {
    if (!contract || !account || !config || !asset) {
      return;
    }

    const logger = localLoggerFactory({ application: 'deposits' });
    try {
      logger.info('get allowance', {
        account,
        contractAddress: config.collateral_bridge_contract.address,
      });
      const res = await contract.allowance(
        account,
        config.collateral_bridge_contract.address
      );
      return new BigNumber(addDecimal(res.toString(), asset.decimals));
    } catch (err) {
      logger.error('get allowance', err);
      return;
    }
  }, [contract, account, config, asset]);

  return getAllowance;
};
