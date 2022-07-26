import type { Token } from '@vegaprotocol/smart-contracts';
import * as Sentry from '@sentry/react';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useEthereumConfig } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { Asset } from './deposit-manager';

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
    try {
      const res = await contract.allowance(
        account,
        config.collateral_bridge_contract.address
      );

      return new BigNumber(addDecimal(res.toString(), asset.decimals));
    } catch (err) {
      Sentry.captureException(err);
      return;
    }
  }, [contract, account, config, asset]);

  return getAllowance;
};
