import * as Sentry from '@sentry/react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import React from 'react';

import { useEnvironment } from '@vegaprotocol/react-helpers';
import {
  AppStateActionType,
  useAppState,
} from '../contexts/app-state/app-state-context';
import { useContracts } from '../contexts/contracts/contracts-context';

export const useRefreshBalances = (address: string) => {
  const { ADDRESSES } = useEnvironment();
  const { appDispatch } = useAppState();
  const { keypair } = useVegaWallet();
  const { token, staking, vesting } = useContracts();

  return React.useCallback(async () => {
    try {
      const [
        balance,
        walletBalance,
        lien,
        allowance,
        walletAssociatedBalance,
        vestingAssociatedBalance,
      ] = await Promise.all([
        vesting.getUserBalanceAllTranches(address),
        token.balanceOf(address),
        vesting.getLien(address),
        token.allowance(address, ADDRESSES.stakingBridge),
        // Refresh connected vega key balances as well if we are connected to a vega key
        keypair?.pub ? staking.stakeBalance(address, keypair.pub) : null,
        keypair?.pub ? vesting.stakeBalance(address, keypair.pub) : null,
      ]);
      appDispatch({
        type: AppStateActionType.REFRESH_BALANCES,
        balance,
        walletBalance,
        allowance,
        lien,
        walletAssociatedBalance,
        vestingAssociatedBalance,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }, [address, appDispatch, keypair?.pub, staking, token, vesting]);
};
