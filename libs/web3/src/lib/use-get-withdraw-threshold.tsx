import { useCallback } from 'react';
import { useBridgeContract } from './use-bridge-contract';
import BigNumber from 'bignumber.js';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { WithdrawalBusEventFieldsFragment } from '@vegaprotocol/wallet';

/**
 * Returns a function to get the threshold amount for a withdrawal. If a withdrawal amount
 * is greater than this value it will incur a delay before being able to be completed. The delay is set
 * on the smart contract and can be retrieved using contract.default_withdraw_delay
 */
export const useGetWithdrawThreshold = () => {
  const contract = useBridgeContract();
  const getThreshold = useCallback(
    async (
      asset:
        | Pick<WithdrawalBusEventFieldsFragment['asset'], 'source' | 'decimals'>
        | undefined
    ) => {
      if (!contract || asset?.source.__typename !== 'ERC20') {
        return new BigNumber(Infinity);
      }
      const res = await contract.get_withdraw_threshold(
        asset.source.contractAddress
      );
      const value = new BigNumber(addDecimal(res.toString(), asset.decimals));
      const threshold = value.isEqualTo(0)
        ? new BigNumber(Infinity)
        : value.minus(new BigNumber(addDecimal('1', asset.decimals)));
      return threshold;
    },
    [contract]
  );

  return getThreshold;
};
